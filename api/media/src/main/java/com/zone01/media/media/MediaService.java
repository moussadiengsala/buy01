package com.zone01.media.media;

import com.zone01.media.config.AccessValidation;
import com.zone01.media.dto.ProductsDTO;
import com.zone01.media.dto.UserDTO;
import com.zone01.media.service.FileServices;
import com.zone01.media.config.kafka.ProductServices;
import com.zone01.media.model.Response;
import jakarta.servlet.http.HttpServletRequest;
//import jakarta.ws.rs.Path;
import lombok.AllArgsConstructor;
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

    private Response<Object> authorization(HttpServletRequest request, String productId) {
        Response<Object> productValidationResponse = productServices.getProductByID(productId, request);
        if (productValidationResponse.getData() == null) {
            return productValidationResponse;
        }

        return null;
    }

    private Response<Object> authorizationWhenDeleteAndUpdate(HttpServletRequest request, String mediaId) {
        Optional<Media> existingMedia = mediaRepository.findById(mediaId);
        if (existingMedia.isEmpty()) {
            return Response.<Object>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .message("Media not found")
                    .data(null)
                    .build();
        }

        Media media = existingMedia.get();
        Response<Object> authorizationResponse = authorization(request, media.getProductId());
        if (authorizationResponse != null) {return authorizationResponse;}

        return Response.<Object>builder()
                .data(media)
                .message("ok")
                .status(HttpStatus.OK.value())
                .build();
    }


    public Response<Object> createMedia(
            String productId,
            List<MultipartFile> files,
            HttpServletRequest request
    ) {
        try {
            Response<Object> authorizationResponse = authorization(request, productId);
            if (authorizationResponse != null) {return authorizationResponse;}

            Response<Object> mediaValidationResponse = fileServices.validateFiles(files, productId, false);
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
            MultipartFile newFile
    ) {
        try {
            Response<Object> authorizationResponse = authorizationWhenDeleteAndUpdate(request, mediaId);
            if (authorizationResponse.getStatus() != HttpStatus.OK.value()) {return authorizationResponse;}

            Media media = (Media) authorizationResponse.getData();
            Response<Object> fileValidationResponse = fileServices.validateFiles(newFile, "", true);
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
            Response<Object> authorizationResponse = authorizationWhenDeleteAndUpdate(request, mediaId);
            if (authorizationResponse.getStatus() != HttpStatus.OK.value()) {return authorizationResponse;}

            Media media = (Media) authorizationResponse.getData();

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
            List<Media> mediaToDelete = mediaRepository.findMediaByProductId(productId);
            if (mediaToDelete.isEmpty()) {
                return Response.<Object>builder()
                        .status(HttpStatus.OK.value())
                        .message("ok")
                        .data(null)
                        .build();
            }

            // Delete files from filesystem
            for (Media media : mediaToDelete) {
                try {
                    fileServices.deleteOldFile(media.getProductId(), media.getImagePath());
                } catch (Exception e) {
                    return Response.<Object>builder()
                            .status(HttpStatus.BAD_REQUEST.value())
                            .message("Media delete failed: " + e.getMessage())
                            .data(null)
                            .build();
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
