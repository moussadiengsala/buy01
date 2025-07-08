package com.buy01.order.order;


import com.buy01.order.model.OrderStatus;
import com.buy01.order.model.OrderStatusHistory;
import com.buy01.order.model.PaymentStatus;
import com.buy01.order.model.ShippingAddress;
import com.buy01.order.model.dto.BillingAddressDTO;
import com.buy01.order.model.dto.CreateOrderDTO;
import com.buy01.order.model.dto.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
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
//    private Double price;
//    private Integer quantity;

    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Field("seller_id")
    @Indexed
    private String sellerId;

    @Field("payment_status")
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.INCOMPLETE;

    @Field("stripe_payment_intent_id")
    private String stripePaymentIntentId; // store ID returned by Stripe

    @Field("stripe_client_secret")
    private String stripeClientSecret; // store client secret for frontend

    @Field("total_amount")
    private Double totalAmount;

    @Field("currency")
    @Builder.Default
    private String currency = "USD";

    @Field("user_id")
    @Indexed
    private String userId;

//    @Field("product_id")
//    @Indexed
//    private String productId;

    @Builder.Default
    private Date createdAt = new Date();
    private Date updatedAt;
    private Date cancelledAt;
    private Date completedAt;

    private List<OrderStatusHistory> statusHistory;
    private ShippingAddress shippingAddress;
    private BillingAddressDTO billingAddress;
    private List<OrderItem> orderItems; // Support multiple items per order

    public Double getTotalAmount() {
        return totalAmount != null ? totalAmount : 0.0;
    }

//    @PreUpdate
    public void preUpdate() {
        this.updatedAt = new Date();
    }

}