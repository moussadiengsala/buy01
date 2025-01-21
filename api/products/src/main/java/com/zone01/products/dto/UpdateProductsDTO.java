package com.zone01.products.dto;

import com.zone01.products.model.Response;
import com.zone01.products.products.Products;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.util.function.Predicate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductsDTO {
    private String name;
    private String description;
    private Double price;
    private Integer quantity;

    public Response<Object> applyUpdates(Products product) {
        boolean isValueUpdated = false;

        if (this.name != null && !this.name.isEmpty()) {
            Response<Object> validationResponse = validateField("name", this.name,
                    value -> value != null &&
                            value.length() >= 2 &&
                            value.length() <= 50 &&
                            value.matches("^[A-Za-zÀ-ÿ0-9\\s'-]+$"),
                    "Invalid name format");
            if (validationResponse != null) {return validationResponse;}
            product.setName(this.name);
            isValueUpdated = true;
        }

        if (this.description != null && !this.description.isEmpty()) {
            Response<Object> validationResponse = validateField("description", this.description,
                    value -> value != null &&
                            value.length() >= 10 &&
                            value.length() <= 255 &&
                            value.matches("^[A-Za-zÀ-ÿ0-9\\s.,!?()'\\-]+$"),
                    "Invalid description format");

            if (validationResponse != null) {return validationResponse;}
            product.setDescription(this.description);
            isValueUpdated = true;
        }

        // Price update
        if (this.price != null) {
            Response<Object> validationResponse = validateField("price", this.price,
                    value -> value != null &&
                            value >= 0.01 &&
                            value <= 100000.00,
                    "Invalid price range");

            if (validationResponse != null) {return validationResponse;}
            product.setPrice(this.price);
            isValueUpdated = true;
        }

        // Quantity update
        if (this.quantity != null) {
            Response<Object> validationResponse = validateField("quantity", this.quantity,
                    value -> value != null &&
                            value > 0 &&
                            value <= 10000,
                    "Invalid quantity");

            if (validationResponse != null) {return validationResponse;}
            product.setQuantity(this.quantity);
            isValueUpdated = true;
        }

        if (!isValueUpdated) {
            return  Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message("No value is submitted.")
                    .data(null)
                    .build();
        }

        return null;
    }

    private <T> Response<Object> validateField(String fieldName, T value, Predicate<T> validator, String errorMessage) {
        if (value == null || !validator.test(value)) {
            return Response.<Object>builder()
                    .status(HttpStatus.BAD_REQUEST.value())
                    .message(fieldName + ": " + errorMessage)
                    .data(null)
                    .build();
        }
        return null;
    }
}