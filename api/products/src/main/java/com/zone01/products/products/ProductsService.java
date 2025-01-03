package com.zone01.products.products;

import com.zone01.products.config.AccessValidation;
import com.zone01.products.config.kafka.MediaServices;
import com.zone01.products.utils.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.BadRequestException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class ProductsService {
    private final ProductsRepository productsRepository;
//    private final MediaClient mediaClient;
    private final MediaServices mediaServices;

    @Autowired
    public ProductsService(ProductsRepository productsRepository, MediaServices mediaServices) {
        this.productsRepository = productsRepository;
        this.mediaServices = mediaServices;
    }

    public Page<Products> getAllProducts(int page, int size) {
        return productsRepository.findAll(PageRequest.of(page, size));
    }

    public Optional<Products> getProductById(String id) {
        return productsRepository.findById(id);
    }

    public Page<Products> getProductByUserId(String id, int page, int size) {
        return productsRepository.findProductsByUserID(id, PageRequest.of(page, size));
    }

    public Products createProduct(Products product, HttpServletRequest request) {

        UserDTO currentUser = AccessValidation.getCurrentUser(request);

        Products newProduct = Products
                .builder()
                .name(product.getName())
                .price(product.getPrice())
                .description(product.getDescription())
                .quantity(product.getQuantity())
                .userID(currentUser.getId())
                .build();

        return productsRepository.save(newProduct);
    }

    private Response<Products> authorizeAndGetProduct(HttpServletRequest request, String id) {
        UserDTO currentUser = AccessValidation.getCurrentUser(request);

        // Find the product by its ID
        Optional<Products> productOptional = productsRepository.findById(id);
        // Check if the product exists
        if (productOptional.isEmpty()) {
            return Response.<Products>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .data(null)
                    .message("Product not found")
                    .build();
        }

        Products product = productOptional.get();
        if (!currentUser.getId().equals(product.getUserID()) || currentUser.getRole() != Role.SELLER) {
            return Response.<Products>builder()
                    .status(HttpStatus.UNAUTHORIZED.value())
                    .data(null)
                    .message("You're not authorized to perform this action.")
                    .build();
        }

        return Response.<Products>builder()
                .status(HttpStatus.OK.value())
                .data(productOptional.get())
                .build();
    }

    public Response<Products> updateProduct(HttpServletRequest request, String id, Map<String, Object> updates) {
        // Authorize and get the product
        Response<Products> authorizationResponse = authorizeAndGetProduct(request, id);
        if (authorizationResponse.getStatus() != HttpStatus.OK.value()) {
            return authorizationResponse;
        }

        Products product = authorizationResponse.getData();

        UpdateProducts updateProducts = UpdateProducts.fromUpdates(updates);
        Map<String, Object> appliedUpdates = updateProducts.applyUpdatesTo(product, updates);
        if (appliedUpdates.isEmpty()) {
            throw new BadRequestException("No valid updates provided");
        }

        // Save updated product
        Products updatedProduct = productsRepository.save(product);

        // Build and return response
        return Response.<Products>builder()
                .status(HttpStatus.OK.value())
                .data(updatedProduct)
                .message("Product updated successfully")
                .build();
    }

    public Response<Products> deleteProduct(String id, HttpServletRequest request) {
        // Authorize and get the product
        Response<Products> authorizationResponse = authorizeAndGetProduct(request, id);
        if (authorizationResponse.getStatus() != HttpStatus.OK.value()) {
            return authorizationResponse;
        }

        Products product = authorizationResponse.getData();
        Response<Object> deletedMediaResponse = mediaServices.deleteMediaRelatedToProduct(product.getId());
        if (deletedMediaResponse != null) {
            return Response.<Products>builder()
                    .status(deletedMediaResponse.getStatus())
                    .data(null)
                    .message(deletedMediaResponse.getMessage())
                    .build();
        }
        productsRepository.deleteById(id);

        // Return success response
        return Response.<Products>builder()
                .status(HttpStatus.OK.value())
                .data(authorizationResponse.getData())
                .message("Product deleted successfully")
                .build();
    }


}
