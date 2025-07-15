package com.buy01.order.order;

import com.buy01.order.config.AccessValidation;
import com.buy01.order.model.OrderStatus;
import com.buy01.order.model.OrderStatusHistory;
import com.buy01.order.model.PaymentStatus;
import com.buy01.order.model.Response;
import com.buy01.order.model.dto.CancelOrderRequestDTO;
import com.buy01.order.model.dto.UserDTO;
import com.buy01.order.service.RefundService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.function.Predicate;

@Service
@Transactional
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final RefundService  refundService;

    public Response<Order> getOrderById(String orderId) {
        Optional<Order> order = orderRepository.findById(orderId);
        if (order.isPresent()) {
            return Response.<Order>builder()
                    .status(200)
                    .message("Order retrieved successfully")
                    .data(order.get())
                    .build();
        } else {
            return Response.<Order>builder()
                    .status(404)
                    .message("Order not found")
                    .build();
        }
    }

    public Response<List<Order>> getOrdersByUserId(String userId) {
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return Response.<List<Order>>builder()
                .status(200)
                .message("Orders retrieved successfully")
                .data(orders)
                .build();
    }

    public Response<List<Order>> getIncompleteOrdersByUserId(String userId) {
        List<Order> incompleteOrders = orderRepository.findByUserIdAndPaymentStatusOrderByCreatedAtDesc(
                userId, PaymentStatus.INCOMPLETE);
        return Response.<List<Order>>builder()
                .status(200)
                .message("Incomplete orders retrieved successfully")
                .data(incompleteOrders)
                .build();
    }

    /**
     * Cancel an order
     */
    public Response<Order> cancelOrder(CancelOrderRequestDTO dto, HttpServletRequest request) {
        UserDTO currentUser = AccessValidation.getCurrentUser(request);

        Optional<Order> orderOpt = orderRepository.findById(dto.getOrderId());
        if (orderOpt.isEmpty()) {
            return Response.notFound("Order not found");
        }

        Order order = orderOpt.get();

        // Validate user ownership
        if (!order.getUserId().equals(currentUser.getId())) {
            return Response.forbidden("You can only cancel your own orders");
        }

        // Check if order can be cancelled
        if (order.getStatus() == OrderStatus.DELIVERED) {
            return Response.badRequest("Delivered orders cannot be cancelled");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            return Response.badRequest("Order is already cancelled");
        }

        // If payment is completed, process refund
        if (order.getPaymentStatus() == PaymentStatus.COMPLETED) {
            return refundService.processFullRefund(dto, order, currentUser.getId());
        }

        // For incomplete payments, just cancel the order
        order.setStatus(OrderStatus.CANCELLED);
        order.setPaymentStatus(PaymentStatus.CANCELLED);
        order.setCancelledAt(new Date());

        // Add status history
        OrderStatusHistory statusHistory = OrderStatusHistory.builder()
                .status(OrderStatus.CANCELLED)
                .paymentStatus(PaymentStatus.CANCELLED)
                .timestamp(new Date())
                .build();

        List<OrderStatusHistory> historyList = order.getStatusHistory() != null
                ? new ArrayList<>(order.getStatusHistory())
                : new ArrayList<>();
        historyList.add(statusHistory);
        order.setStatusHistory(historyList);

        Order savedOrder = orderRepository.save(order);
        return Response.ok(savedOrder, "Order cancelled successfully");
    }


    /**
     * Delete an order (soft delete)
     */
    public Response<String> deleteOrder(String orderId, HttpServletRequest request) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return Response.notFound("Order not found");
        }

        Order order = orderOpt.get();
        UserDTO currentUser = AccessValidation.getCurrentUser(request);
        if (!order.getUserId().equals(currentUser.getId())) return Response.forbidden("You can only delete your own orders");

        // Only allow deletion of cancelled or failed orders
        if (order.getStatus() != OrderStatus.CANCELLED &&
                order.getPaymentStatus() != PaymentStatus.FAILED) {
            return Response.badRequest("Only cancelled or failed orders can be deleted");
        }

        orderRepository.delete(order);
        return Response.ok("Order deleted successfully");
    }

    /**
     * Search orders with filters
     */
    public Response<List<Order>> searchOrders(String userId, String keyword,
                                              OrderStatus status, PaymentStatus paymentStatus,
                                              Date startDate, Date endDate) {

        List<Order> orders = orderRepository.findOrdersWithFilters(
                userId, keyword, status, paymentStatus, startDate, endDate);

        return Response.ok(orders, "Orders retrieved successfully");
    }

    public Response<List<Order>> getUserOrdersPaginated(String userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);

        return Response.ok(orderPage.getContent(), "Orders retrieved successfully");
    }

    /**
     * Get seller orders with pagination
     */
    public Response<List<Order>> getSellerOrdersPaginated(String sellerId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orderPage = orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId, pageable);

        return Response.ok(orderPage.getContent(), "Seller orders retrieved successfully");
    }

    public Response<List<Order>> getRefundableOrders(String userId) {
        List<Order> refundableOrders = orderRepository.findRefundableOrdersByUserId(userId);
        return Response.ok(refundableOrders, "Refundable orders retrieved successfully");
    }

    /**
     * Get orders that can be cancelled
     */
    public Response<List<Order>> getCancellableOrders(String userId) {
        List<Order> cancellableOrders = orderRepository.findCancellableOrdersByUserId(userId);
        return Response.ok(cancellableOrders, "Cancellable orders retrieved successfully");
    }

    /**
     * Update order status (for sellers)
     */
    public Response<Order> updateOrderStatus(String orderId, String sellerId,
                                             OrderStatus newStatus) {
        Optional<Order> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            return Response.notFound("Order not found");
        }

        Order order = orderOpt.get();

        // Validate seller ownership
        if (!order.getSellerId().equals(sellerId)) {
            return Response.forbidden("You can only update your own orders");
        }

        // Update status
        order.setStatus(newStatus);
        order.setUpdatedAt(new Date());

        if (newStatus == OrderStatus.DELIVERED) {
            order.setCompletedAt(new Date());
        }

        // Add status history
        OrderStatusHistory statusHistory = OrderStatusHistory.builder()
                .status(newStatus)
                .paymentStatus(order.getPaymentStatus())
                .timestamp(new Date())
                .build();

        List<OrderStatusHistory> historyList = order.getStatusHistory() != null
                ? new ArrayList<>(order.getStatusHistory())
                : new ArrayList<>();
        historyList.add(statusHistory);
        order.setStatusHistory(historyList);

        Order savedOrder = orderRepository.save(order);
        return Response.ok(savedOrder, "Order status updated successfully");
    }

    /**
     * Get order statistics for user profile
     */
    public Response<Map<String, Object>> getUserOrderStats(String userId) {
        List<Order> userOrders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", userOrders.size());
        stats.put("totalSpent", userOrders.stream()
                .filter(order -> order.getPaymentStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(Order::getTotalAmount)
                .sum());
        stats.put("completedOrders", userOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.DELIVERED)
                .count());

        return Response.ok(stats, "User order statistics retrieved");
    }

    /**
     * Get order statistics for seller profile
     */
    public Response<Map<String, Object>> getSellerOrderStats(String sellerId) {
        List<Order> sellerOrders = orderRepository.findBySellerIdOrderByCreatedAtDesc(sellerId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", sellerOrders.size());
        stats.put("totalEarnings", sellerOrders.stream()
                .filter(order -> order.getPaymentStatus() == PaymentStatus.COMPLETED)
                .mapToDouble(Order::getTotalAmount)
                .sum());
        stats.put("pendingOrders", sellerOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.PENDING)
                .count());

        return Response.ok(stats, "Seller order statistics retrieved");
    }
}


















//public class OrderService {
//
//    private final OrderRepository orderRepository;
////    private final MongoTemplate mongoTemplate;
//
//    @Autowired
//    public OrderService(OrderRepository orderRepository) {
//        this.orderRepository = orderRepository;
//    }
//
//    // Create order
//    public Response<Order> createOrder(CreateOrderDTO dto, HttpServletRequest request) {
//        UserDTO currentUser = AccessValidation.getCurrentUser(request);
//        return Response.created(orderRepository.save(dto.toOrder(currentUser)));
//    }
//
////    // Advanced search with criteria
////    public Page<Order> searchOrders(OrderSearchCriteria criteria, int page, int size, String sortBy, String sortDir) {
////        Query query = new Query();
////        Criteria combinedCriteria = new Criteria();
////        List<Criteria> criteriaList = new ArrayList<>();
////
////        // Add search criteria
////        if (criteria.getUserId() != null && !criteria.getUserId().isEmpty()) {
////            criteriaList.add(Criteria.where("userId").is(criteria.getUserId()));
////        }
////
////        if (criteria.getSellerId() != null && !criteria.getSellerId().isEmpty()) {
////            criteriaList.add(Criteria.where("sellerId").is(criteria.getSellerId()));
////        }
////
////        if (criteria.getStatus() != null) {
////            criteriaList.add(Criteria.where("status").is(criteria.getStatus()));
////        }
////
////        if (criteria.getStartDate() != null && criteria.getEndDate() != null) {
////            criteriaList.add(Criteria.where("createdAt").gte(criteria.getStartDate()).lte(criteria.getEndDate()));
////        }
////
////        if (criteria.getMinAmount() != null && criteria.getMaxAmount() != null) {
////            criteriaList.add(new Criteria().andOperator(
////                    Criteria.where("price").exists(true),
////                    Criteria.where("quantity").exists(true)
////            ).and("$expr").is(
////                    new org.springframework.data.mongodb.core.query.BasicQuery(
////                            "{'$and': [" +
////                                    "{'$gte': [{'$multiply': ['$price', '$quantity']}, " + criteria.getMinAmount() + "]}, " +
////                                    "{'$lte': [{'$multiply': ['$price', '$quantity']}, " + criteria.getMaxAmount() + "]}" +
////                                    "]}"
////                    )
////            ));
////        }
////
////        if (criteria.getTrackingNumber() != null && !criteria.getTrackingNumber().isEmpty()) {
////            criteriaList.add(Criteria.where("trackingNumber").regex(criteria.getTrackingNumber(), "i"));
////        }
////
////        if (criteria.getSearchText() != null && !criteria.getSearchText().isEmpty()) {
////            criteriaList.add(new Criteria().orOperator(
////                    Criteria.where("productName").regex(criteria.getSearchText(), "i"),
////                    Criteria.where("userName").regex(criteria.getSearchText(), "i"),
////                    Criteria.where("sellerName").regex(criteria.getSearchText(), "i"),
////                    Criteria.where("notes").regex(criteria.getSearchText(), "i")
////            ));
////        }
////
////        if (!criteriaList.isEmpty()) {
////            combinedCriteria.andOperator(criteriaList.toArray(new Criteria[0]));
////            query.addCriteria(combinedCriteria);
////        }
////
////        // Add sorting
////        Sort sort = sortDir.equalsIgnoreCase("desc") ?
////                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
////
////        // Add pagination
////        Pageable pageable = PageRequest.of(page, size, sort);
////        query.with(pageable);
////
////        List<Order> orders = mongoTemplate.find(query, Order.class);
////        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Order.class);
////
////        return new PageImpl<>(orders, pageable, total);
////    }
////
////    // Get user orders with search
////    public Page<Order> getUserOrders(String userId, String searchText, int page, int size) {
////        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
////
////        if (searchText != null && !searchText.isEmpty()) {
////            return orderRepository.searchUserOrders(userId, searchText, pageable);
////        }
////
////        return orderRepository.findByUserId(userId, pageable);
////    }
////
////    // Get seller orders with search
////    public Page<Order> getSellerOrders(String sellerId, String searchText, int page, int size) {
////        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
////
////        if (searchText != null && !searchText.isEmpty()) {
////            return orderRepository.searchSellerOrders(sellerId, searchText, pageable);
////        }
////
////        return orderRepository.findBySellerId(sellerId, pageable);
////    }
////
////    // Cancel order
////    public Order cancelOrder(String orderId, String reason, String cancelledBy) {
////        return orderRepository.findById(orderId)
////                .map(order -> {
////                    if (!order.canBeCancelled()) {
////                        throw new InvalidOrderException("Order cannot be cancelled in current status: " + order.getStatus());
////                    }
////
////                    order.setStatus(OrderStatus.CANCELLED);
////                    order.setCancelledAt(new Date());
////                    order.setCancellationReason(reason);
////                    order.setUpdatedAt(new Date());
////
////                    // Add to status history
////                    addStatusHistory(order, OrderStatus.CANCELLED, cancelledBy, reason);
////
////                    return orderRepository.save(order);
////                })
////                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
////    }
////
////    // Return order
////    public Order returnOrder(String orderId, String reason, String returnedBy) {
////        return orderRepository.findById(orderId)
////                .map(order -> {
////                    if (!order.canBeReturned()) {
////                        throw new InvalidOrderException("Order cannot be returned in current status: " + order.getStatus());
////                    }
////
////                    order.setStatus(OrderStatus.RETURNED);
////                    order.setUpdatedAt(new Date());
////
////                    // Add to status history
////                    addStatusHistory(order, OrderStatus.RETURNED, returnedBy, reason);
////
////                    return orderRepository.save(order);
////                })
////                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
////    }
////
////    // Redo order (create new order based on cancelled/returned order)
////    public Order redoOrder(String orderId, String redoneBy) {
////        return orderRepository.findById(orderId)
////                .map(originalOrder -> {
////                    if (!originalOrder.canBeRedone()) {
////                        throw new InvalidOrderException("Order cannot be redone in current status: " + originalOrder.getStatus());
////                    }
////
////                    // Create new order based on original
////                    Order newOrder = Order.builder()
////                            .productId(originalOrder.getProductId())
////                            .productName(originalOrder.getProductName())
////                            .sellerId(originalOrder.getSellerId())
////                            .sellerName(originalOrder.getSellerName())
////                            .price(originalOrder.getPrice())
////                            .quantity(originalOrder.getQuantity())
////                            .userId(originalOrder.getUserId())
////                            .userName(originalOrder.getUserName())
////                            .shippingAddress(originalOrder.getShippingAddress())
////                            .paymentInfo(originalOrder.getPaymentInfo())
////                            .notes("Redone from order: " + orderId)
////                            .build();
////
////                    return createOrder(newOrder);
////                })
////                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
////    }
////
////    // Update order status with history
////    public Order updateOrderStatus(String orderId, OrderStatus newStatus, String updatedBy, String reason) {
////        return orderRepository.findById(orderId)
////                .map(order -> {
////                    validateStatusTransition(order.getStatus(), newStatus);
////
////                    order.setStatus(newStatus);
////                    order.setUpdatedAt(new Date());
////
////                    // Add to status history
////                    addStatusHistory(order, newStatus, updatedBy, reason);
////
////                    return orderRepository.save(order);
////                })
////                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
////    }
////
////    // Track order by tracking number
////    public Optional<Order> trackOrder(String trackingNumber) {
////        return orderRepository.findByTrackingNumber(trackingNumber);
////    }
////
////    // Get order statistics for user
////    public OrderStatistics getUserOrderStatistics(String userId) {
////        List<Order> userOrders = orderRepository.findByUserId(userId);
////        return calculateStatistics(userOrders);
////    }
////
////    // Get order statistics for seller
////    public OrderStatistics getSellerOrderStatistics(String sellerId) {
////        List<Order> sellerOrders = orderRepository.findBySellerId(sellerId);
////        return calculateStatistics(sellerOrders);
////    }
////
////    // Delete order (soft delete by marking as cancelled)
////    public void deleteOrder(String orderId, String deletedBy, String reason) {
////        cancelOrder(orderId, reason != null ? reason : "Order deleted", deletedBy);
////    }
////
////    // Helper methods
////    private void addStatusHistory(Order order, OrderStatus status, String updatedBy, String reason) {
////        OrderStatusHistory historyEntry = OrderStatusHistory.builder()
////                .status(status)
////                .timestamp(new Date())
////                .updatedBy(updatedBy)
////                .reason(reason)
////                .build();
////
////        if (order.getStatusHistory() == null) {
////            order.setStatusHistory(new ArrayList<>());
////        }
////        order.getStatusHistory().add(historyEntry);
////    }
////
////    private String generateTrackingNumber() {
////        return "TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
////    }
////
////    private OrderStatistics calculateStatistics(List<Order> orders) {
////        if (orders.isEmpty()) {
////            return OrderStatistics.builder().build();
////        }
////
////        long totalOrders = orders.size();
////        long pendingOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.PENDING ? 1 : 0).sum();
////        long confirmedOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.CONFIRMED ? 1 : 0).sum();
////        long processingOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.PROCESSING ? 1 : 0).sum();
////        long shippedOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.SHIPPED ? 1 : 0).sum();
////        long deliveredOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.DELIVERED ? 1 : 0).sum();
////        long cancelledOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.CANCELLED ? 1 : 0).sum();
////        long returnedOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.RETURNED ? 1 : 0).sum();
////
////        double totalAmount = orders.stream().mapToDouble(Order::getTotalAmount).sum();
////        double averageOrderValue = totalAmount / totalOrders;
////
////        return OrderStatistics.builder()
////                .totalOrders(totalOrders)
////                .pendingOrders(pendingOrders)
////                .confirmedOrders(confirmedOrders)
////                .processingOrders(processingOrders)
////                .shippedOrders(shippedOrders)
////                .deliveredOrders(deliveredOrders)
////                .cancelledOrders(cancelledOrders)
////                .returnedOrders(returnedOrders)
////                .totalAmount(totalAmount)
////                .averageOrderValue(averageOrderValue)
////                .build();
////    }
////
////    private void validateOrder(Order order) {
////        if (order.getPrice() == null || order.getPrice() <= 0) {
////            throw new InvalidOrderException("Price must be greater than 0");
////        }
////        if (order.getQuantity() == null || order.getQuantity() <= 0) {
////            throw new InvalidOrderException("Quantity must be greater than 0");
////        }
////        if (order.getProductId() == null || order.getProductId().trim().isEmpty()) {
////            throw new InvalidOrderException("Product ID is required");
////        }
////        if (order.getUserId() == null || order.getUserId().trim().isEmpty()) {
////            throw new InvalidOrderException("User ID is required");
////        }
////        if (order.getSellerId() == null || order.getSellerId().trim().isEmpty()) {
////            throw new InvalidOrderException("Seller ID is required");
////        }
////    }
////
////    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
////        if (currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.RETURNED) {
////            throw new InvalidOrderException("Cannot change status of cancelled or returned order");
////        }
////
////        if (currentStatus == OrderStatus.DELIVERED && newStatus != OrderStatus.RETURNED) {
////            throw new InvalidOrderException("Delivered order can only be returned");
////        }
////
////        if (currentStatus == OrderStatus.REFUNDED) {
////            throw new InvalidOrderException("Cannot change status of refunded order");
////        }
////    }
//}
