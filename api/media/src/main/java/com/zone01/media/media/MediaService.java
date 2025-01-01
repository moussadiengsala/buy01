package com.zone01.media.media;

import com.zone01.media.config.AccessValidation;
import com.zone01.media.utils.FileServices;
import com.zone01.media.config.kafka.ProductServices;
import com.zone01.media.utils.Response;
import jakarta.servlet.http.HttpServletRequest;
//import jakarta.ws.rs.Path;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
public class MediaService {

    private final MediaRepository mediaRepository;
    private final ProductServices productServices;
    private final FileServices fileServices;

    @Value("${media.max.file.size:2097152}") // Default 2MB
    private long maxFileSize;
    @Value("${media.allowed.content.types:image/jpeg,image/png,image/gif,image/webp}")
    private List<String> allowedContentTypes;
    @Value("${media.upload.base.dir:uploads}")
    private String baseUploadDirectory;

    @Autowired
    public MediaService(MediaRepository mediaRepository, ProductServices productServices) {
        this.mediaRepository = mediaRepository;
        this.productServices = productServices;
        this.fileServices = new FileServices();
    }

    public Optional<Media> getMediaById(String id) {
        return mediaRepository.findById(id);
    }

    public List<Media> getMediaByProductId(String id) {
        return mediaRepository.findMediaByProductID(id);
    }

    public Response<Object> createMedia(
            String productId,
            List<MultipartFile> files,
            HttpServletRequest request
    ) {
        try {
            // Validate user and product
            UserDTO currentUser = AccessValidation.getCurrentUser(request);
            Response<Object> productValidationResponse = productServices.getProductByID(productId);

            if (productValidationResponse.getData() == null) {
                return productValidationResponse;
            }

            // Validate and save each file
            List<String> savedFiles = new ArrayList<>();
            for (MultipartFile file : files) {
                // Validate file
                Response<Object> fileValidationResponse = fileServices.validateFile(file, maxFileSize, allowedContentTypes);
                System.out.println(fileValidationResponse);
                if (fileValidationResponse != null) {
                    return fileValidationResponse;
                }

                // Save file securely
                String filename = fileServices.saveFile(file, productId, baseUploadDirectory);
                savedFiles.add(filename);

                // Create and save media record
                Media newMedia = Media.builder()
                        .imagePath(filename)
                        .productID(productId)
                        .build();

                mediaRepository.save(newMedia);
            }

            return Response.<Object>builder()
                    .status(HttpStatus.CREATED.value())
                    .message("Media uploaded successfully")
                    .data(savedFiles)
                    .build();

        } catch (Exception e) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Media upload failed: " + e.getMessage())
                    .data(null)
                    .build();
        }
    }

    public Response<Object> updateMedia(
            HttpServletRequest request,
            String mediaId,
            MultipartFile newFile
    ) {
        try {
            // Find existing media
            Optional<Media> existingMedia = mediaRepository.findById(mediaId);
            if (existingMedia.isEmpty()) {
                return Response.<Object>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Media not found")
                        .data(null)
                        .build();
            }

            // Validate user access to product
            Media media = existingMedia.get();
            UserDTO currentUser = AccessValidation.getCurrentUser(request);
            Response<Object> productValidationResponse = productServices.getProductByID(media.getProductID());


            if (productValidationResponse.getData() == null) {
                return productValidationResponse;
            }

            // Validate and save new file if provided
            if (newFile != null && !newFile.isEmpty()) {
                Response<Object> fileValidationResponse = fileServices.validateFile(newFile, maxFileSize, allowedContentTypes);
                if (fileValidationResponse != null) {
                    return fileValidationResponse;
                }

                // Delete old file
                fileServices.deleteOldFile(media.getImagePath());

                // Save new file
                String newFilename = fileServices.saveFile(newFile, media.getProductID(), baseUploadDirectory);
                media.setImagePath(newFilename);
            }

            // Save updated media
            Media updatedMedia = mediaRepository.save(media);

            return Response.<Object>builder()
                    .status(HttpStatus.OK.value())
                    .message("Media updated successfully")
                    .data(updatedMedia)
                    .build();

        } catch (Exception e) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Media update failed: " + e.getMessage())
                    .data(null)
                    .build();
        }
    }

    public Response<Object> deleteMedia(String mediaId, HttpServletRequest request) {
        try {
            // Find existing media
            Optional<Media> existingMedia = mediaRepository.findById(mediaId);
            if (existingMedia.isEmpty()) {
                return Response.<Object>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("Media not found")
                        .data(null)
                        .build();
            }

            // Validate user access to product
            Media media = existingMedia.get();
            UserDTO currentUser = AccessValidation.getCurrentUser(request);
            Response<Object> productValidationResponse = productServices.getProductByID(media.getProductID());

            if (productValidationResponse.getData() == null) {
                return productValidationResponse;
            }

            fileServices.deleteOldFile(media.getImagePath());
            mediaRepository.deleteById(media.getId());

            return Response.<Object>builder()
                    .status(HttpStatus.OK.value())
                    .message("Media deleted successfully")
                    .data(media)
                    .build();

        } catch (Exception e) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Media update failed: " + e.getMessage())
                    .data(null)
                    .build();
        }
    }

    public Response<Object> deleteMediaByProductId(String productId, HttpServletRequest request) {
        try {
            // Validate user access to product
            UserDTO currentUser = AccessValidation.getCurrentUser(request);
            Response<Object> productValidationResponse = productServices.getProductByID(productId);

            // Check if user has valid access to the product
            if (productValidationResponse.getData() == null) {
                return productValidationResponse;
            }

            // Find all media associated with the product
            List<Media> mediaToDelete = mediaRepository.findMediaByProductID(productId);

            // If no media found, return appropriate response
            if (mediaToDelete.isEmpty()) {
                return Response.<Object>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("No media found for the specified product")
                        .data(null)
                        .build();
            }

            // Delete files from filesystem
            for (Media media : mediaToDelete) {
                try {
                    fileServices.deleteOldFile(media.getImagePath());
                } catch (Exception e) {
                    // Log the error but continue deleting other files
                    // You might want to replace this with actual logging
                    System.err.println("Error deleting file: " + media.getImagePath());
                }
            }

            // Delete media records from database
            mediaRepository.deleteAll(mediaToDelete);

            return Response.<Object>builder()
                    .status(HttpStatus.OK.value())
                    .message("All media for the product deleted successfully")
                    .data(mediaToDelete)
                    .build();

        } catch (Exception e) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Media deletion failed: " + e.getMessage())
                    .data(null)
                    .build();
        }
    }
}
