package com.buy01.order.order;

import com.buy01.order.model.OrderStatus;
import com.buy01.order.model.PaymentStatus;
import com.buy01.order.model.Response;
import com.buy01.order.model.dto.CancelOrderRequestDTO;
import com.buy01.order.model.dto.CheckoutRequestDTO;
import com.buy01.order.model.dto.CheckoutResponse;
import com.buy01.order.model.dto.OrderConfirmationDTO;
import com.buy01.order.service.CheckoutService;
import com.stripe.exception.StripeException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/order")
public class OrderController {
    private final OrderService orderService;
    private final CheckoutService checkoutService;

    @PostMapping("/checkout/integrated")
    public ResponseEntity<CheckoutResponse> integratedCheckout(
            @RequestBody CheckoutRequestDTO requestDTO,
            HttpServletRequest request) throws StripeException {

        CheckoutResponse response = checkoutService.createIncompleteOrder(requestDTO, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/confirm")
    public ResponseEntity<Response<Order>> confirmOrder(
            @RequestBody OrderConfirmationDTO confirmationDTO,
            HttpServletRequest request) throws StripeException {

        Response<Order> response = checkoutService.confirmOrder(confirmationDTO, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        checkoutService.handleStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok("Webhook processed");
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Response<Order>> getOrder(@PathVariable String orderId) {
        Response<Order> response = orderService.getOrderById(orderId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Response<List<Order>>> getUserOrders(@PathVariable String userId) {
        Response<List<Order>> response = orderService.getOrdersByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/incomplete/user/{userId}")
    public ResponseEntity<Response<List<Order>>> getIncompleteOrders(@PathVariable String userId) {
        Response<List<Order>> response = orderService.getIncompleteOrdersByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<Response<Order>> cancelOrder(
            @RequestBody CancelOrderRequestDTO dto, HttpServletRequest request) {
        Response<Order> response = orderService.cancelOrder(dto, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an order
     */
    @DeleteMapping("/{orderId}")
    public ResponseEntity<Response<String>> deleteOrder(
            @PathVariable String orderId,
            HttpServletRequest request) {
        Response<String> response = orderService.deleteOrder(orderId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Search orders with filters
     */
    @GetMapping("/search")
    public ResponseEntity<Response<List<Order>>> searchOrders(
            @RequestParam String userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Response<List<Order>> response = orderService.searchOrders(
                userId, keyword, status, paymentStatus, startDate, endDate);
        return ResponseEntity.ok(response);
    }

    /**
     * Get orders for seller
     */
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<Response<List<Order>>> getSellerOrders(
            @PathVariable String sellerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Response<List<Order>> response = orderService.getSellerOrdersPaginated(sellerId, page, size);
        return ResponseEntity.ok(response);
    }

    /**
     * Update order status (for sellers)
     */
    @PutMapping("/{orderId}/status")
    public ResponseEntity<Response<Order>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam String sellerId,
            @RequestParam OrderStatus status) {
        Response<Order> response = orderService.updateOrderStatus(orderId, sellerId, status);
        return ResponseEntity.ok(response);
    }

    /**
     * Get user order statistics for profile
     */
    @GetMapping("/stats/user/{userId}")
    public ResponseEntity<Response<Map<String, Object>>> getUserOrderStats(
            @PathVariable String userId) {
        Response<Map<String, Object>> response = orderService.getUserOrderStats(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get seller order statistics for profile
     */
    @GetMapping("/stats/seller/{sellerId}")
    public ResponseEntity<Response<Map<String, Object>>> getSellerOrderStats(
            @PathVariable String sellerId) {
        Response<Map<String, Object>> response = orderService.getSellerOrderStats(sellerId);
        return ResponseEntity.ok(response);
    }
}