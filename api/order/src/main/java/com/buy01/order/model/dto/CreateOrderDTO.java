package com.buy01.order.model.dto;

import com.buy01.order.model.OrderStatus;
import com.buy01.order.model.OrderStatusHistory;
import com.buy01.order.order.Order;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Date;
import java.util.List;

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

//    private ShippingAddress shippingAddress;

//    public Order toOrder(UserDTO user) {
//
//        OrderStatusHistory initialStatus = OrderStatusHistory.builder()
//                .status(OrderStatus.PENDING)
//                .timestamp(new Date())
//                .updatedBy("SYSTEM")
//                .reason("Order created")
//                .build();
//
//        return Order.builder()
//                .productId(this.getProductId())
//                .userId(user.getId())
//                .statusHistory(List.of(initialStatus))
//                .build();
//    }
}


