package com.zone01.media.utils;

import com.zone01.media.media.MediaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileServices {
    private final long maxFileSize;
    private final int maxFileCount;
    private final List<String> allowedContentTypes;
    private final String baseUploadDirectory;
    private final MediaRepository mediaRepository;

    public FileServices(
            @Value("${media.upload.max.file.size}") long maxFileSize,
            @Value("${media.upload.max.file.count}") int maxFileCount,
            @Value("${media.allowed.content.types}") List<String> allowedContentTypes,
            @Value("${media.upload.base.dir}") String baseUploadDirectory,
            MediaRepository mediaRepository
    ) {
        this.maxFileSize = maxFileSize;
        this.maxFileCount = maxFileCount;
        this.allowedContentTypes = allowedContentTypes;
        this.baseUploadDirectory = baseUploadDirectory;
        this.mediaRepository = mediaRepository;
    }

    public Response<Object> validateFiles(List<MultipartFile> files, boolean isSingleFiles) {
        if (files == null || files.isEmpty()) {
            return buildErrorResponse("No files provided");
        }

        if (files.size() > maxFileCount && !isSingleFiles) {
            return buildErrorResponse("Maximum file count exceeded: " + maxFileCount);
        }

        if (isSingleFiles && files.size() != 1) {
            return buildErrorResponse("You should provide a single file");
        }

        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                return buildErrorResponse("Empty file detected");
            }

            if (file.getSize() > maxFileSize) {
                return buildErrorResponse("File size exceeds limit: " + formatSize(maxFileSize));
            }

            String contentType = file.getContentType();
            if (contentType == null || !allowedContentTypes.contains(contentType)) {
                return buildErrorResponse("Invalid file type. Allowed: " + allowedContentTypes);
            }
        }

        return null;
    }

    public List<String> saveFiles(List<MultipartFile> files, String productId) throws IOException {
        String uploadDir = baseUploadDirectory + "/" + productId + "/";
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        List<String> savedFiles = new ArrayList<>();
        for (MultipartFile file : files) {
            String uniqueFilename = generateUniqueFilename(file, productId);
            Path targetLocation = uploadPath.resolve(uniqueFilename).normalize();

            if (!targetLocation.startsWith(uploadPath)) {
                throw new IOException("Invalid file path detected");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            savedFiles.add(uniqueFilename);
        }

        return savedFiles;
    }

    private String generateUniqueFilename(MultipartFile file, String productId) {
        String sanitizedName = sanitizeFilename(file.getOriginalFilename());
        String extension = getFileExtension(sanitizedName);
        return UUID.randomUUID() + "_" + productId + extension;
    }

    private String sanitizeFilename(String filename) {
        return Optional.ofNullable(filename)
                .map(name -> name.replaceAll("[^a-zA-Z0-9._-]", ""))
                .orElse("");
    }

    private String formatSize(long bytes) {
        return bytes / 1024 / 1024 + " MB";
    }

    private Response<Object> buildErrorResponse(String message) {
        return Response.<Object>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message(message)
                .build();
    }

    private String getFileExtension(String filename) {
        return Optional.ofNullable(filename)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf(".")).toLowerCase())
                .orElse("");
    }

    public Response<Object> deleteOldFile(String productId, String imagePath) throws IOException {
        Path filePath = Paths.get(baseUploadDirectory).resolve(productId).resolve(imagePath).normalize();
        if (!filePath.startsWith(Paths.get(baseUploadDirectory))) {
            return buildErrorResponse("Invalid file path");
        }
        Files.deleteIfExists(filePath);
        return null;
    }

    public Response<Object> getImages(String productId, String imagePath) {
        try {
            // Sanitize productId and imagePath
            if (productId == null || imagePath == null || productId.isBlank() || imagePath.isBlank()) {
                return buildErrorResponse("Invalid product ID or imagePath");
            }

            Path filePath = Paths.get(baseUploadDirectory).resolve(productId).resolve(imagePath).normalize();
            if (!filePath.startsWith(Paths.get(baseUploadDirectory))) {
                return buildErrorResponse("Invalid file path");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return buildErrorResponse("File not found");
            }

            return Response.<Object>builder()
                    .message("Success")
                    .status(HttpStatus.OK.value())
                    .data(resource)
                    .build();
        } catch (Exception e) {
            return buildErrorResponse("Failed to retrieve file");
        }
    }
}
