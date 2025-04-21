package com.zone01.media.media;

import com.zone01.media.config.kafka.ProductServices;
import com.zone01.media.model.Response;
import com.zone01.media.service.FileServices;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MediaServiceTest {

    @Mock
    private MediaRepository mediaRepository;

    @Mock
    private ProductServices productServices;

    @Mock
    private FileServices fileServices;

    @InjectMocks
    private MediaService mediaService;

    private final String testProductId = "test-product-id";
    private final String testMediaId = "test-media-id";
    private final String testUserId = "test-user-id";
    private MultipartFile testFile;
    private Media testMedia;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        testFile = new MockMultipartFile(
                "test.jpg",
                "test.jpg",
                "image/jpeg",
                "test content".getBytes()
        );

        testMedia = Media.builder()
                .id(testMediaId)
                .productId(testProductId)
                .imagePath("test.jpg")
                .build();

        request = new MockHttpServletRequest();
        request.setAttribute("userId", testUserId);
    }

    @Test
    void getMediaById_Success() {
        when(mediaRepository.findById(testMediaId)).thenReturn(Optional.of(testMedia));

        Optional<Media> result = mediaService.getMediaById(testMediaId);

        assertTrue(result.isPresent());
        assertEquals(testMedia, result.get());
    }

    @Test
    void getMediaById_NotFound() {
        when(mediaRepository.findById(testMediaId)).thenReturn(Optional.empty());

        Optional<Media> result = mediaService.getMediaById(testMediaId);

        assertFalse(result.isPresent());
    }

    @Test
    void getMediaByProductId_Success() {
        List<Media> expectedMedia = List.of(testMedia);
        when(mediaRepository.findMediaByProductId(testProductId)).thenReturn(expectedMedia);

        List<Media> result = mediaService.getMediaByProductId(testProductId);

        assertEquals(expectedMedia, result);
        verify(mediaRepository).findMediaByProductId(testProductId);
    }

    @Test
    void createMedia_Success() throws Exception {
        List<MultipartFile> files = Arrays.asList(testFile);
        when(fileServices.validateFiles(any(), any(), anyBoolean())).thenReturn(null);
        when(fileServices.saveFiles(any(), any())).thenReturn(Arrays.asList("saved/test.jpg"));
        when(mediaRepository.save(any(Media.class))).thenReturn(testMedia);

        Response<Object> response = mediaService.createMedia(testProductId, files, request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED.value(), response.getStatus());
        assertEquals("Media created successfully", response.getMessage());
        assertNotNull(response.getData());
    }

    @Test
    void createMedia_ValidationError() throws Exception {
        List<MultipartFile> files = Arrays.asList(testFile);
        Response<Object> validationError = new Response<>();
        validationError.setStatus(HttpStatus.BAD_REQUEST.value());
        validationError.setMessage("Invalid file");
        when(fileServices.validateFiles(any(), any(), anyBoolean())).thenReturn(validationError);

        Response<Object> response = mediaService.createMedia(testProductId, files, request);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("Invalid file", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void createMedia_FileError() throws Exception {
        List<MultipartFile> files = Arrays.asList(testFile);
        when(fileServices.validateFiles(any(), any(), anyBoolean())).thenReturn(null);
        when(fileServices.saveFiles(any(), any())).thenThrow(new IOException("File error"));

        Response<Object> response = mediaService.createMedia(testProductId, files, request);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
        assertEquals("File error", response.getMessage());
        assertNull(response.getData());
    }

    @Test
    void updateMedia_Success() throws Exception {
        when(mediaRepository.findById(testMediaId)).thenReturn(Optional.of(testMedia));
        when(fileServices.validateFiles(any(), any(), anyBoolean())).thenReturn(null);
        when(fileServices.saveFiles(any(), any())).thenReturn(Arrays.asList("saved/new-test.jpg"));
        when(mediaRepository.save(any(Media.class))).thenReturn(testMedia);

        Response<Object> response = mediaService.updateMedia(request, testMediaId, testFile);

        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("Media updated successfully", response.getMessage());
        assertNotNull(response.getData());
    }

    @Test
    void updateMedia_NotFound() throws Exception {
        when(mediaRepository.findById(testMediaId)).thenReturn(Optional.empty());

        Response<Object> response = mediaService.updateMedia(request, testMediaId, testFile);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertEquals("Media not found", response.getMessage());
        assertNull(response.getData());
    }


    @Test
    void deleteMedia_Success() throws Exception {
        when(mediaRepository.findById(testMediaId)).thenReturn(Optional.of(testMedia));
        when(fileServices.deleteOldFile(any(), any())).thenReturn(null);
        doNothing().when(mediaRepository).deleteById(testMediaId);

        Response<Object> response = mediaService.deleteMedia(testMediaId, request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("Media deleted successfully", response.getMessage());
    }

    @Test
    void deleteMedia_NotFound() throws Exception {
        when(mediaRepository.findById(testMediaId)).thenReturn(Optional.empty());

        Response<Object> response = mediaService.deleteMedia(testMediaId, request);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertEquals("Media not found", response.getMessage());
    }

    @Test
    void deleteMediaByProductId_Success() throws Exception {
        List<Media> mediaList = Arrays.asList(testMedia);
        when(mediaRepository.findMediaByProductId(testProductId)).thenReturn(mediaList);
        when(fileServices.deleteOldFile(any(), any())).thenReturn(null);
        doNothing().when(mediaRepository).deleteById(any());

        Response<Object> response = mediaService.deleteMediaByProductId(testProductId);

        assertNotNull(response);
        assertEquals(HttpStatus.OK.value(), response.getStatus());
        assertEquals("Media deleted successfully", response.getMessage());
    }

    @Test
    void deleteMediaByProductId_NoMediaFound() throws Exception {
        when(mediaRepository.findMediaByProductId(testProductId)).thenReturn(new ArrayList<>());

        Response<Object> response = mediaService.deleteMediaByProductId(testProductId);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND.value(), response.getStatus());
        assertEquals("No media found for this product", response.getMessage());
    }
} 