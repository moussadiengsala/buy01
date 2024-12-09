package com.zone01.media.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.media.media.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductValidationServices {
    private final ProductClient productClient;
    private final ObjectMapper jacksonObjectMapper;

    public Response<Object> validateProduct(String productID, UserDTO user) {
        if (productID == null || productID.isBlank()) {
            return buildResponse(HttpStatus.BAD_REQUEST.value(), null, "Product ID cannot be empty.");
        }

        // Fetch the product using the product client
        Response<ProductsDTO> productResponse = productClient.getProductByID(productID);

        // Check if the product exists
        if (productResponse == null || productResponse.getData() == null) {
            return buildResponse(HttpStatus.NOT_FOUND.value(), null, "The product does not exist.");
        }

        ProductsDTO product = productResponse.getData();

        // Verify the product belongs to the user
        if (!product.getUserID().equals(user.getId())) {
            return buildResponse(HttpStatus.FORBIDDEN.value(), null, "You do not have access to this product.");
        }

        // Return the validated product
        return buildResponse(HttpStatus.OK.value(), product, "Product validated successfully.");
    }


    private <T> Response<T> buildResponse(int status, T data, String message) {
        return Response.<T>builder()
                .status(status)
                .message(message)
                .data(data)
                .build();
    }
}
