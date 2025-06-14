package com.zone01.media.service;

import com.zone01.media.media.Media;
import com.zone01.media.media.MediaRepository;
import com.zone01.media.model.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileServicesTest {

    @Mock
    private MediaRepository mediaRepository;

    @InjectMocks
    private FileServices fileServices;

    private final long maxFileSize = 5 * 1024 * 1024; // 5MB
    private final int maxFileCount = 5;
    private final List<String> allowedContentTypes = Arrays.asList("image/jpeg", "image/png");
    private final String baseUploadDirectory = "test-uploads";
    private final String testProductId = "test-product-id";
    private MultipartFile validFile;
    private MultipartFile largeFile;
    private MultipartFile invalidTypeFile;

    @BeforeEach
    void setUp() {
        fileServices = new FileServices(
                maxFileSize,
                maxFileCount,
                allowedContentTypes,
                baseUploadDirectory,
                mediaRepository
        );

        validFile = new MockMultipartFile(
                "test.jpg",
                "test.jpg",
                "image/jpeg",
                "test content".getBytes()
        );

        largeFile = new MockMultipartFile(
                "large.jpg",
                "large.jpg",
                "image/jpeg",
                new byte[(int) (maxFileSize + 1)]
        );

        invalidTypeFile = new MockMultipartFile(
                "test.txt",
                "test.txt",
                "text/plain",
                "test content".getBytes()
        );
    }

//    @Test
//    void validateFiles_SingleFile_Success() {
//        Response<Object> response = fileServices.validateFiles(validFile, testProductId, true);
//        assertNull(response);
//    }

//    @Test
//    void validateFiles_MultipleFiles_Success() {
//        List<MultipartFile> files = Arrays.asList(validFile, validFile);
//        Response<Object> response = fileServices.validateFiles(files, testProductId, false);
//        assertNull(response);
//    }

//    @Test
//    void validateFiles_EmptyFileList() {
//        List<MultipartFile> emptyList = new ArrayList<>();
//        Response<Object> response = fileServices.validateFiles(emptyList, testProductId, false);
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("No files provided", response.getMessage());
//    }

//    @Test
//    void validateFiles_SingleFileExpectedButMultipleProvided() {
//        List<MultipartFile> files = Arrays.asList(validFile, validFile);
//        Response<Object> response = fileServices.validateFiles(files, testProductId, true);
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("You should provide a single file", response.getMessage());
//    }

//    @Test
//    void validateFiles_MaxFileCountExceeded() {
//        List<MultipartFile> files = Arrays.asList(validFile, validFile, validFile, validFile, validFile, validFile);
//        when(mediaRepository.findMediaByProductId(testProductId)).thenReturn(new ArrayList<>());
//        Response<Object> response = fileServices.validateFiles(files, testProductId, false);
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("Maximum file count exceeded: " + maxFileCount, response.getMessage());
//    }

//    @Test
//    void validateFiles_EmptyFile() {
//        MultipartFile emptyFile = new MockMultipartFile(
//                "empty.jpg",
//                "empty.jpg",
//                "image/jpeg",
//                new byte[0]
//        );
//        Response<Object> response = fileServices.validateFiles(emptyFile, testProductId, true);
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("Empty file detected", response.getMessage());
//    }

//    @Test
//    void validateFiles_FileTooLarge() {
//        Response<Object> response = fileServices.validateFiles(largeFile, testProductId, true);
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("File size exceeds limit: " + (maxFileSize / 1024 / 1024) + " MB", response.getMessage());
//    }

//    @Test
//    void validateFiles_InvalidFileType() {
//        Response<Object> response = fileServices.validateFiles(invalidTypeFile, testProductId, true);
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("Invalid file type. Allowed: " + allowedContentTypes, response.getMessage());
//    }

//    @Test
//    void saveFiles_Success() throws IOException {
//        List<MultipartFile> files = Arrays.asList(validFile);
//        List<String> savedFiles = fileServices.saveFiles(files, testProductId);
//        assertNotNull(savedFiles);
//        assertEquals(1, savedFiles.size());
//        assertTrue(savedFiles.get(0).contains(testProductId));
//        assertTrue(savedFiles.get(0).endsWith(".jpg"));
//    }

//    @Test
//    void saveFiles_EmptyList() throws IOException {
//        List<MultipartFile> emptyList = new ArrayList<>();
//        List<String> savedFiles = fileServices.saveFiles(emptyList, testProductId);
//        assertTrue(savedFiles.isEmpty());
//    }

//    @Test
//    void deleteOldFile_Success() throws IOException {
//        // Create a test file
//        Path testFilePath = Paths.get(baseUploadDirectory, testProductId, "test.jpg");
//        Files.createDirectories(testFilePath.getParent());
//        Files.write(testFilePath, "test content".getBytes());
//
//        Response<Object> response = fileServices.deleteOldFile(testProductId, "test.jpg");
//        assertNull(response);
//        assertFalse(Files.exists(testFilePath));
//    }

//    @Test
//    void deleteOldFile_InvalidPath() throws IOException {
//        Response<Object> response = fileServices.deleteOldFile(testProductId, "../test.jpg");
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("Invalid file path", response.getMessage());
//    }

//    @Test
//    void getImages_Success() throws IOException {
//        // Create a test file
//        Path testFilePath = Paths.get(baseUploadDirectory, testProductId, "test.jpg");
//        Files.createDirectories(testFilePath.getParent());
//        Files.write(testFilePath, "test content".getBytes());
//
//        Response<Object> response = fileServices.getImages(testProductId, "test.jpg");
//        assertNotNull(response);
//        assertEquals(HttpStatus.OK.value(), response.getStatus());
//        assertEquals("Success", response.getMessage());
//        assertTrue(response.getData() instanceof Resource);
//    }

//    @Test
//    void getImages_InvalidPath() {
//        Response<Object> response = fileServices.getImages(testProductId, "../test.jpg");
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("Invalid file path", response.getMessage());
//    }

//    @Test
//    void getImages_FileNotFound() {
//        Response<Object> response = fileServices.getImages(testProductId, "nonexistent.jpg");
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("File not found", response.getMessage());
//    }

//    @Test
//    void getImages_InvalidParameters() {
//        Response<Object> response = fileServices.getImages("", "");
//        assertNotNull(response);
//        assertEquals(HttpStatus.BAD_REQUEST.value(), response.getStatus());
//        assertEquals("Invalid product ID or imagePath", response.getMessage());
//    }
} 