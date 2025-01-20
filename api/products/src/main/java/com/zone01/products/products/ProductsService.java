package com.zone01.products.products;

import com.zone01.products.config.AccessValidation;
import com.zone01.products.config.kafka.MediaServices;
import com.zone01.products.dto.CreateProductDTO;
import com.zone01.products.dto.UpdateProductsDTO;
import com.zone01.products.dto.UserDTO;
import com.zone01.products.model.Response;
import com.zone01.products.model.Role;
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

    public Products createProduct(CreateProductDTO product, HttpServletRequest request) {

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

    private Response<Object> authorizeAndGetProduct(HttpServletRequest request, String id) {
        UserDTO currentUser = AccessValidation.getCurrentUser(request);

        Optional<Products> productOptional = productsRepository.findById(id);
        if (productOptional.isEmpty()) {
            return Response.<Object>builder()
                    .status(HttpStatus.NOT_FOUND.value())
                    .data(null)
                    .message("Product not found")
                    .build();
        }

        Products product = productOptional.get();
        if (!currentUser.getId().equals(product.getUserID())) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .data(null)
                    .message("You're not authorized to perform this action.")
                    .build();
        }

        return Response.<Object>builder()
                .status(HttpStatus.OK.value())
                .data(productOptional.get())
                .build();
    }

    public Response<Object> updateProduct(HttpServletRequest request, String id, UpdateProductsDTO updateProductsDTO) {
        Response<Object> authorizationResponse = authorizeAndGetProduct(request, id);
        if (authorizationResponse.getStatus() != HttpStatus.OK.value()) {
            return authorizationResponse;
        }

        Products product = (Products) authorizationResponse.getData();

        Response<Object> updateResponse = updateProductsDTO.applyUpdates(product);
        if (updateResponse != null) {return updateResponse;}

        // Save updated product
        Products updatedProduct = productsRepository.save(product);

        // Build and return response
        return Response.<Object>builder()
                .status(HttpStatus.OK.value())
                .data(updatedProduct)
                .message("Product updated successfully")
                .build();
    }

    public Response<Object> deleteProduct(String id, HttpServletRequest request) {
        // Authorize and get the product
        Response<Object> authorizationResponse = authorizeAndGetProduct(request, id);
        if (authorizationResponse.getStatus() != HttpStatus.OK.value()) {
            return authorizationResponse;
        }

        Products product = (Products) authorizationResponse.getData();
        Response<Object> deletedMediaResponse = mediaServices.deleteMediaRelatedToProduct(product.getId());
        if (deletedMediaResponse != null) {
            return Response.<Object>builder()
                    .status(deletedMediaResponse.getStatus())
                    .data(null)
                    .message(deletedMediaResponse.getMessage())
                    .build();
        }
        productsRepository.deleteById(id);

        // Return success response
        return Response.<Object>builder()
                .status(HttpStatus.OK.value())
                .data(authorizationResponse.getData())
                .message("Product deleted successfully")
                .build();
    }


}
