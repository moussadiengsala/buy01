package com.zone01.media.media;

import com.zone01.media.config.AccessValidation;
import com.zone01.media.utils.FileServices;
import com.zone01.media.config.kafka.ProductServices;
import com.zone01.media.utils.Response;
import jakarta.servlet.http.HttpServletRequest;
//import jakarta.ws.rs.Path;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@AllArgsConstructor
public class MediaService {

    private final MediaRepository mediaRepository;
    private final ProductServices productServices;
    private final FileServices fileServices;

    public Optional<Media> getMediaById(String id) {
        return mediaRepository.findById(id);
    }

    public Response<Object> getMetadataMedia(String productId, String imagePath) {
        return fileServices.getImages(productId, imagePath);
    }

    public List<Media> getMediaByProductId(String id) {
        return mediaRepository.findMediaByProductId(id);
    }

    public Response<Object> createMedia(
            String productId,
            List<MultipartFile> files,
            HttpServletRequest request
    ) {
        System.out.println(productId);
        try {
            UserDTO currentUser = AccessValidation.getCurrentUser(request);
            Response<Object> productValidationResponse = productServices.getProductByID(productId);

            if (productValidationResponse.getData() == null) {
                return productValidationResponse;
            }

            ProductsDTO product = (ProductsDTO) productValidationResponse.getData();
            if (!currentUser.getId().equals(product.getUserID())) {
                return Response.<Object>builder()
                        .status(HttpStatus.FORBIDDEN.value())
                        .message("You can only perform this operation to your product.")
                        .data(null)
                        .build();
            }

            Response<Object> mediaValidationResponse = fileServices.validateFiles(files, false);
            if (mediaValidationResponse != null) {
                return mediaValidationResponse;
            }

            // Validate and save each file
            List<String> savedFiles = fileServices.saveFiles(files, productId);
            for (String filename : savedFiles) {
                Media newMedia = Media.builder()
                        .imagePath(filename)
                        .productId(productId)
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
            List<MultipartFile> newFile
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
            Response<Object> productValidationResponse = productServices.getProductByID(media.getProductId());

            if (productValidationResponse.getData() == null) {
                return productValidationResponse;
            }

            // Validate and save new file if provided
            Response<Object> fileValidationResponse = fileServices.validateFiles(newFile, true);
            if (fileValidationResponse != null) {
                return fileValidationResponse;
            }

            List<String> newFilename = fileServices.saveFiles(newFile, media.getProductId());
            Response<Object> mediaDeleteResponse= fileServices.deleteOldFile(media.getProductId(), media.getImagePath());
            if (mediaDeleteResponse != null) { return mediaDeleteResponse; }
            media.setImagePath(newFilename.get(0));

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
            Response<Object> productValidationResponse = productServices.getProductByID(media.getProductId());

            if (productValidationResponse.getData() == null) {
                return productValidationResponse;
            }

            Response<Object> deleteResponse = fileServices.deleteOldFile(media.getProductId(), media.getImagePath());
            if (deleteResponse != null) { return deleteResponse; }
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

    public Response<Object> deleteMediaByProductId(String productId) {
        try {
//            Response<Object> productValidationResponse = productServices.getProductByID(productId);

            // Check if user has valid access to the product
//            if (productValidationResponse.getData() == null) {
//                return productValidationResponse;
//            }

            // Find all media associated with the product
            List<Media> mediaToDelete = mediaRepository.findMediaByProductId(productId);

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
                    fileServices.deleteOldFile(media.getProductId(), media.getImagePath());
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
                    .data(null)
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
