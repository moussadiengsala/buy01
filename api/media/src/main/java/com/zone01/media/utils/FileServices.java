package com.zone01.media.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class FileServices {
    @Value("${media.max.file.size:2097152}") // Default 2MB
    private long maxFileSize;

    @Value("${media.allowed.content.types:image/jpeg,image/png,image/gif,image/webp}")
    private List<String> allowedContentTypes;

    @Value("${media.upload.base.dir:uploads}")
    private String baseUploadDirectory;

    public void deleteOldFile(String filename) throws IOException {
        Path filePath = Paths.get("uploads").resolve(filename).normalize();
        Files.deleteIfExists(filePath);
    }

    public Response<Object> validateFile(MultipartFile file) {
        // Check if file is empty
        if (file == null || file.isEmpty()) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("File is empty")
                    .build();
        }

        // Validate file size
        if (file.getSize() > maxFileSize) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("File size exceeds maximum limit of 10MB")
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

        return null; // Validation passed
    }

    public String saveFile(MultipartFile file, String productId) throws IOException {
        // Generate secure filename with additional sanitization
        String originalFilename = Optional.ofNullable(file.getOriginalFilename())
                .map(this::sanitizeFilename)
                .orElse("");

        String fileExtension = Optional.ofNullable(originalFilename)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(originalFilename.lastIndexOf(".")))
                .orElse("");

        String uniqueFilename = UUID.randomUUID() + "_" + productId + fileExtension;

        // Secure file path handling
        String uploadDir = baseUploadDirectory + "/" + productId + "/";
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

    // New utility method to sanitize filename
    private String sanitizeFilename(String originalFilename) {
        // Remove any potentially dangerous characters
        return originalFilename.replaceAll("[^a-zA-Z0-9._-]", "");
    }
}
