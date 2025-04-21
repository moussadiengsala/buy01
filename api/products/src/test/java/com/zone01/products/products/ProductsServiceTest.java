package com.zone01.products.products;

import com.zone01.products.config.AccessValidation;
import com.zone01.products.config.kafka.MediaServices;
import com.zone01.products.dto.CreateProductDTO;
import com.zone01.products.dto.UpdateProductsDTO;
import com.zone01.products.dto.UserDTO;
import com.zone01.products.model.Response;
import com.zone01.products.model.Role;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductsServiceTest {

    @Mock
    private ProductsRepository productsRepository;

    @Mock
    private MediaServices mediaServices;

    @Mock
    private HttpServletRequest request;

    @InjectMocks
    private ProductsService productsService;

    private final String testUserId = "test-user-id";
    private final String testProductId = "test-product-id";
    private Products testProduct;
    private UserDTO testUser;
    private CreateProductDTO createProductDTO;
    private UpdateProductsDTO updateProductsDTO;

    @BeforeEach
    void setUp() {
        testUser = UserDTO.builder()
                .id(testUserId)
                .role(Role.SELLER)
                .build();

        testProduct = Products.builder()
                .id(testProductId)
                .name("Test Product")
                .description("Test Description")
                .price(99.99)
                .quantity(10)
                .userID(testUserId)
                .build();

        createProductDTO = CreateProductDTO.builder()
                .name("New Product")
                .description("New Description")
                .price(149.99)
                .quantity(5)
                .build();

        updateProductsDTO = new UpdateProductsDTO();
    }

    @Test
    void getAllProducts_Success() {
        List<Products> products = List.of(testProduct);
        Page<Products> productPage = new PageImpl<>(products);
        when(productsRepository.findAll(any(PageRequest.class))).thenReturn(productPage);

        Page<Products> result = productsService.getAllProducts(0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(testProduct, result.getContent().get(0));
    }

    @Test
    void getProductById_Success() {
        when(productsRepository.findById(testProductId)).thenReturn(Optional.of(testProduct));

        Optional<Products> result = productsService.getProductById(testProductId);

        assertTrue(result.isPresent());
        assertEquals(testProduct, result.get());
    }

    @Test
    void getProductById_NotFound() {
        when(productsRepository.findById(testProductId)).thenReturn(Optional.empty());

        Optional<Products> result = productsService.getProductById(testProductId);

        assertFalse(result.isPresent());
    }

    @Test
    void getProductByUserId_Success() {
        List<Products> products = List.of(testProduct);
        Page<Products> productPage = new PageImpl<>(products);
        when(productsRepository.findProductsByUserID(testUserId, PageRequest.of(0, 10))).thenReturn(productPage);

        Page<Products> result = productsService.getProductByUserId(testUserId, 0, 10);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(testProduct, result.getContent().get(0));
    }

    @Test
    void createProduct_Success() {
        Mockito.mockStatic(AccessValidation.class).when(() -> AccessValidation.getCurrentUser(request)).thenReturn(testUser);
        when(productsRepository.save(any(Products.class))).thenReturn(testProduct);

        Products result = productsService.createProduct(createProductDTO, request);

        assertNotNull(result);
        assertEquals(createProductDTO.getName(), result.getName());
        assertEquals(createProductDTO.getDescription(), result.getDescription());
        assertEquals(createProductDTO.getPrice(), result.getPrice());
        assertEquals(createProductDTO.getQuantity(), result.getQuantity());
        assertEquals(testUserId, result.getUserID());
    }

    @Test
    void updateProduct_Success() {
        Mockito.mockStatic(AccessValidation.class).when(() -> AccessValidation.getCurrentUser(request)).thenReturn(testUser);
        when(productsRepository.findById(testProductId)).thenReturn(Optional.of(testProduct));
        when(productsRepository.save(any(Products.class))).thenReturn(testProduct);

        updateProductsDTO.setName("Updated Product");
        updateProductsDTO.setPrice(199.99);

        Response<Object> result = productsService.updateProduct(request, testProductId, updateProductsDTO);

        assertNotNull(result);
        assertEquals(HttpStatus.OK.value(), result.getStatus());
        assertEquals("Product updated successfully", result.getMessage());
        assertNotNull(result.getData());
    }

    @Test
    void updateProduct_NotFound() {
        Mockito.mockStatic(AccessValidation.class).when(() -> AccessValidation.getCurrentUser(request)).thenReturn(testUser);
        when(productsRepository.findById(testProductId)).thenReturn(Optional.empty());

        Response<Object> result = productsService.updateProduct(request, testProductId, updateProductsDTO);

        assertNotNull(result);
        assertEquals(HttpStatus.NOT_FOUND.value(), result.getStatus());
        assertEquals("Product not found", result.getMessage());
        assertNull(result.getData());
    }

    @Test
    void updateProduct_Unauthorized() {
        UserDTO differentUser = UserDTO.builder()
                .id("different-user-id")
                .role(Role.SELLER)
                .build();
        Mockito.mockStatic(AccessValidation.class).when(() -> AccessValidation.getCurrentUser(request)).thenReturn(differentUser);
        when(productsRepository.findById(testProductId)).thenReturn(Optional.of(testProduct));

        Response<Object> result = productsService.updateProduct(request, testProductId, updateProductsDTO);

        assertNotNull(result);
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getStatus());
        assertEquals("You're not authorized to perform this action.", result.getMessage());
        assertNull(result.getData());
    }

    @Test
    void deleteProduct_Success() {
        Mockito.mockStatic(AccessValidation.class).when(() -> AccessValidation.getCurrentUser(request)).thenReturn(testUser);
        when(productsRepository.findById(testProductId)).thenReturn(Optional.of(testProduct));
//        when(mediaServices.deleteMediaRelatedToProduct(testProductId)).thenReturn(null);
        doNothing().when(productsRepository).deleteById(testProductId);

        Response<Object> result = productsService.deleteProduct(testProductId, request);

        assertNotNull(result);
        assertEquals(HttpStatus.OK.value(), result.getStatus());
        assertEquals("Product deleted successfully", result.getMessage());
        assertNotNull(result.getData());
    }

    @Test
    void deleteProduct_NotFound() {
        Mockito.mockStatic(AccessValidation.class).when(() -> AccessValidation.getCurrentUser(request)).thenReturn(testUser);
        when(productsRepository.findById(testProductId)).thenReturn(Optional.empty());

        Response<Object> result = productsService.deleteProduct(testProductId, request);

        assertNotNull(result);
        assertEquals(HttpStatus.NOT_FOUND.value(), result.getStatus());
        assertEquals("Product not found", result.getMessage());
        assertNull(result.getData());
    }

    @Test
    void deleteProduct_MediaError() {
        Mockito.mockStatic(AccessValidation.class).when(() -> AccessValidation.getCurrentUser(request)).thenReturn(testUser);
        when(productsRepository.findById(testProductId)).thenReturn(Optional.of(testProduct));
        Response<Object> mediaError = Response.<Object>builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .message("Media deletion failed")
                .build();
//        when(mediaServices.deleteMediaRelatedToProduct(testProductId)).thenReturn(mediaError);

        Response<Object> result = productsService.deleteProduct(testProductId, request);

        assertNotNull(result);
        assertEquals(HttpStatus.BAD_REQUEST.value(), result.getStatus());
        assertEquals("Media deletion failed", result.getMessage());
        assertNull(result.getData());
    }
} 