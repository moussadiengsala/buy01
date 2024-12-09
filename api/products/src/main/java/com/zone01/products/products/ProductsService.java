package com.zone01.products.products;

import com.mongodb.client.MongoIterable;
import com.zone01.products.config.AccessValidation;
import com.zone01.products.utils.Response;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.BadRequestException;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductsService {
    private final ProductsRepository productsRepository;
    private final MediaClient mediaClient;

    @Autowired
    public ProductsService(ProductsRepository productsRepository, MediaClient mediaClient) {
        this.mediaClient = mediaClient;
        this.productsRepository = productsRepository;
    }

    public List<Products> getAllProducts() {
        return productsRepository.findAll();
    }

    public Optional<Products> getProductById(String id) {
        return productsRepository.findById(id);
    }

    public List<Products> getProductByUserId(String id) {
        return productsRepository.findProductsByUserID(id);
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

        Response<Object> mediaResponse = mediaClient.deleteMediaByProductId(id);
        productsRepository.deleteById(id);

        // Return success response
        return Response.<Products>builder()
                .status(HttpStatus.OK.value())
                .data(authorizationResponse.getData())
                .message("Product deleted successfully")
                .build();
    }


}
