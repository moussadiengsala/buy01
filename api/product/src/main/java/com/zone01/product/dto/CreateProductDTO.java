package com.zone01.product.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class CreateProductDTO {
    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    @Pattern(regexp = "^[A-Za-zÀ-ÿ0-9\\s'-]+$", message = "Name can only contain letters, numbers, spaces, hyphens, and apostrophes")
    private String name;

    @NotBlank(message = "Description is required and cannot be empty")
    @Size(min = 10, max = 255, message = "Description must be between 10 and 255 characters long")
    @Pattern(regexp = "^[A-Za-zÀ-ÿ0-9\\s.,!?()'\\-]+$",
            message = "Description contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    @DecimalMin(value = "0.01", message = "Minimum price is 0.01")
    @DecimalMax(value = "100000.00", message = "Maximum price is 100,000.00")
    private Double price;

    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    @DecimalMax(value = "10000", message = "Maximum quantity is 10,000")
    private Integer quantity;
}


