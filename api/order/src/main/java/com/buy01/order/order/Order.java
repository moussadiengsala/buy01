package com.buy01.order.order;


import com.buy01.order.model.OrderStatus;
import com.buy01.order.model.OrderStatusHistory;
import com.buy01.order.model.ShippingAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Date;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "order")
public class Order {
    @Id
    private String id;
    private Double price;
    private Integer quantity;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Field("seller_id")
    @Indexed
    private String sellerId;

    @Field("user_id")
    @Indexed
    private String userId;

    @Field("product_id")
    @Indexed
    private String productId;

    @Builder.Default
    private Date createdAt = new Date();
    private Date updatedAt;

    private Date cancelledAt;

    private List<OrderStatusHistory> statusHistory;
    private ShippingAddress shippingAddress;

    public Double getTotalAmount() {
        return price != null && quantity != null ? price * quantity : 0.0;
    }
}