package com.zone01.media.media;

import com.zone01.media.utils.Response;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/products")
public class MediaController {
    private final MediaService mediaService;

    @GetMapping("/{id}")
    public ResponseEntity<Response<Media>> getMediaById(@PathVariable String id) {
        return mediaService.getMediaById(id)
                .map(product -> {
                    Response<Media> response = Response.<Media>builder()
                            .status(HttpStatus.OK.value())
                            .data(product)
                            .message("success")
                            .build();
                    return ResponseEntity.status(HttpStatus.OK).body(response);
                })
                .orElseGet(() -> {
                    Response<Media> response = Response.<Media>builder()
                            .status(HttpStatus.NOT_FOUND.value())
                            .data(null)
                            .message("Product not found")
                            .build();
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @GetMapping("/product/{id}")
    public ResponseEntity<Response<List<Media>>> getMediaByProductId(@PathVariable String id) {
        List<Media> product = mediaService.getMediaByProductId(id);
        Response<List<Media>> response = Response.<List<Media>>builder()
                .status(HttpStatus.OK.value())
                .data(product)
                .message("success")
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/{product_id}")
    public ResponseEntity<Response<Object>> createMedia(
            @PathVariable String product_id,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) {
        Response<Object> createdMedia = mediaService.createMedia(product_id, file, request);
        return ResponseEntity.status(createdMedia.getStatus()).body(createdMedia);
    }

    @PutMapping("/{media_id}")
    public ResponseEntity<Response<Object>> updateMedia(
            @PathVariable String media_id,
            HttpServletRequest request,
            @RequestParam("file") MultipartFile newFile
            ) {
        Response<Object> updatedMedia = mediaService.updateMedia(request, media_id, newFile);
        return ResponseEntity.status(updatedMedia.getStatus()).body(updatedMedia);
    }

    @DeleteMapping("/{media_id}")
    public ResponseEntity<Response<Object>> deleteProduct(@PathVariable String media_id, HttpServletRequest request) {
        Response<Object> deletedMedia = mediaService.deleteMedia(media_id, request);
        return ResponseEntity.status(deletedMedia.getStatus()).body(deletedMedia);
    }

    @DeleteMapping("/product/{product_id}")
    public ResponseEntity<Response<Object>> deleteMediaByProductId(@PathVariable String product_id, HttpServletRequest request) {
        Response<Object> deletedMedia = mediaService.deleteMediaByProductId(product_id, request);
        return ResponseEntity.status(deletedMedia.getStatus()).body(deletedMedia);
    }
}