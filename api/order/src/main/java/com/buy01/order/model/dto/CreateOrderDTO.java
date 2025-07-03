package com.buy01.order.model.dto;

import com.buy01.order.model.ShippingAddress;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class CreateOrderDTO {
    @NotBlank(message = "Product ID is required")
    private String productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Seller ID is required")
    private String sellerId;

    private ShippingAddress shippingAddress;
}


