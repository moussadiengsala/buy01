package com.zone01.users.utils;

import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileServices {
    @Value("${media.max.file.size}") // Default 2MB
    private long maxFileSize;

    @Value("${media.allowed.content.types}")
    private List<String> allowedContentTypes;

    @Value("${media.upload.base.dir}")
    private String baseUploadDirectory;


    public String saveFile(MultipartFile file) throws IOException {
        // Generate secure filename with additional sanitization
        String originalFilename = Optional.ofNullable(file.getOriginalFilename())
                .map(this::sanitizeFilename)
                .orElse("");

        String fileExtension = Optional.ofNullable(originalFilename)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(originalFilename.lastIndexOf(".")))
                .orElse("");

        String uniqueFilename = UUID.randomUUID() + "_" + fileExtension;

        // Secure file path handling
        String uploadDir = baseUploadDirectory + "/";
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Ensure upload directory exists
        Files.createDirectories(uploadPath);

        // Validate and save file
        Path targetLocation = uploadPath.resolve(uniqueFilename).normalize();

        // Additional path traversal protection
        if (!targetLocation.startsWith(uploadPath)) {
            throw new IOException("Invalid file path");
        }

        // Save file with logging
        try {
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
//            log.info("File saved successfully: {}", targetLocation);
            return uniqueFilename;
        } catch (IOException e) {
//            log.error("File save failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    public void deleteOldFile(String filename) throws IOException {
        Path filePath = Paths.get(baseUploadDirectory).resolve(filename).normalize();
        Files.deleteIfExists(filePath);
    }

    public Response<Object> validateFile(MultipartFile file) {
        // Validate file size
        if (file.getSize() > maxFileSize) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("File size exceeds maximum limit of 2MB")
                    .build();
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !allowedContentTypes.contains(contentType)) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("Invalid file type. Allowed types: " + allowedContentTypes)
                    .build();
        }

        return null;
    }

    // New utility method to sanitize filename
    private String sanitizeFilename(String originalFilename) {
        // Remove any potentially dangerous characters
        return originalFilename.replaceAll("[^a-zA-Z0-9._-]", "");
    }

    public Response<Object> getImages(String filename) {
        try {
            Path filePath = Paths.get(baseUploadDirectory).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return Response.<Object>builder()
                        .message("File not found")
                        .status(HttpStatus.NOT_FOUND.value())
                        .data(null)
                        .build();
            }

            return Response.<Object>builder()
                    .message("File retrieved successfully")
                    .status(HttpStatus.OK.value())
                    .data(resource)
                    .build();

        } catch (Exception e) {
            return Response.<Object>builder()
                    .message("Failed to retrieve file")
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .build();
        }
    }
}
