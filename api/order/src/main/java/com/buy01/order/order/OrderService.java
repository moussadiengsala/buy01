package com.buy01.order.order;

import com.buy01.order.config.AccessValidation;
import com.buy01.order.model.OrderStatus;
import com.buy01.order.model.OrderStatusHistory;
import com.buy01.order.model.Response;
import com.buy01.order.model.dto.CreateOrderDTO;
import com.buy01.order.model.dto.UserDTO;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.jaxb.SpringDataJaxb;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.http.HttpRequest;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
//    private final MongoTemplate mongoTemplate;

    @Autowired
    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    // Create order
    public Response<Order> createOrder(CreateOrderDTO dto, HttpServletRequest request) {
        UserDTO currentUser = AccessValidation.getCurrentUser(request);
        return Response.created(orderRepository.save(dto.toOrder(currentUser)));
    }

//    // Advanced search with criteria
//    public Page<Order> searchOrders(OrderSearchCriteria criteria, int page, int size, String sortBy, String sortDir) {
//        Query query = new Query();
//        Criteria combinedCriteria = new Criteria();
//        List<Criteria> criteriaList = new ArrayList<>();
//
//        // Add search criteria
//        if (criteria.getUserId() != null && !criteria.getUserId().isEmpty()) {
//            criteriaList.add(Criteria.where("userId").is(criteria.getUserId()));
//        }
//
//        if (criteria.getSellerId() != null && !criteria.getSellerId().isEmpty()) {
//            criteriaList.add(Criteria.where("sellerId").is(criteria.getSellerId()));
//        }
//
//        if (criteria.getStatus() != null) {
//            criteriaList.add(Criteria.where("status").is(criteria.getStatus()));
//        }
//
//        if (criteria.getStartDate() != null && criteria.getEndDate() != null) {
//            criteriaList.add(Criteria.where("createdAt").gte(criteria.getStartDate()).lte(criteria.getEndDate()));
//        }
//
//        if (criteria.getMinAmount() != null && criteria.getMaxAmount() != null) {
//            criteriaList.add(new Criteria().andOperator(
//                    Criteria.where("price").exists(true),
//                    Criteria.where("quantity").exists(true)
//            ).and("$expr").is(
//                    new org.springframework.data.mongodb.core.query.BasicQuery(
//                            "{'$and': [" +
//                                    "{'$gte': [{'$multiply': ['$price', '$quantity']}, " + criteria.getMinAmount() + "]}, " +
//                                    "{'$lte': [{'$multiply': ['$price', '$quantity']}, " + criteria.getMaxAmount() + "]}" +
//                                    "]}"
//                    )
//            ));
//        }
//
//        if (criteria.getTrackingNumber() != null && !criteria.getTrackingNumber().isEmpty()) {
//            criteriaList.add(Criteria.where("trackingNumber").regex(criteria.getTrackingNumber(), "i"));
//        }
//
//        if (criteria.getSearchText() != null && !criteria.getSearchText().isEmpty()) {
//            criteriaList.add(new Criteria().orOperator(
//                    Criteria.where("productName").regex(criteria.getSearchText(), "i"),
//                    Criteria.where("userName").regex(criteria.getSearchText(), "i"),
//                    Criteria.where("sellerName").regex(criteria.getSearchText(), "i"),
//                    Criteria.where("notes").regex(criteria.getSearchText(), "i")
//            ));
//        }
//
//        if (!criteriaList.isEmpty()) {
//            combinedCriteria.andOperator(criteriaList.toArray(new Criteria[0]));
//            query.addCriteria(combinedCriteria);
//        }
//
//        // Add sorting
//        Sort sort = sortDir.equalsIgnoreCase("desc") ?
//                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
//
//        // Add pagination
//        Pageable pageable = PageRequest.of(page, size, sort);
//        query.with(pageable);
//
//        List<Order> orders = mongoTemplate.find(query, Order.class);
//        long total = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Order.class);
//
//        return new PageImpl<>(orders, pageable, total);
//    }
//
//    // Get user orders with search
//    public Page<Order> getUserOrders(String userId, String searchText, int page, int size) {
//        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
//
//        if (searchText != null && !searchText.isEmpty()) {
//            return orderRepository.searchUserOrders(userId, searchText, pageable);
//        }
//
//        return orderRepository.findByUserId(userId, pageable);
//    }
//
//    // Get seller orders with search
//    public Page<Order> getSellerOrders(String sellerId, String searchText, int page, int size) {
//        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
//
//        if (searchText != null && !searchText.isEmpty()) {
//            return orderRepository.searchSellerOrders(sellerId, searchText, pageable);
//        }
//
//        return orderRepository.findBySellerId(sellerId, pageable);
//    }
//
//    // Cancel order
//    public Order cancelOrder(String orderId, String reason, String cancelledBy) {
//        return orderRepository.findById(orderId)
//                .map(order -> {
//                    if (!order.canBeCancelled()) {
//                        throw new InvalidOrderException("Order cannot be cancelled in current status: " + order.getStatus());
//                    }
//
//                    order.setStatus(OrderStatus.CANCELLED);
//                    order.setCancelledAt(new Date());
//                    order.setCancellationReason(reason);
//                    order.setUpdatedAt(new Date());
//
//                    // Add to status history
//                    addStatusHistory(order, OrderStatus.CANCELLED, cancelledBy, reason);
//
//                    return orderRepository.save(order);
//                })
//                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
//    }
//
//    // Return order
//    public Order returnOrder(String orderId, String reason, String returnedBy) {
//        return orderRepository.findById(orderId)
//                .map(order -> {
//                    if (!order.canBeReturned()) {
//                        throw new InvalidOrderException("Order cannot be returned in current status: " + order.getStatus());
//                    }
//
//                    order.setStatus(OrderStatus.RETURNED);
//                    order.setUpdatedAt(new Date());
//
//                    // Add to status history
//                    addStatusHistory(order, OrderStatus.RETURNED, returnedBy, reason);
//
//                    return orderRepository.save(order);
//                })
//                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
//    }
//
//    // Redo order (create new order based on cancelled/returned order)
//    public Order redoOrder(String orderId, String redoneBy) {
//        return orderRepository.findById(orderId)
//                .map(originalOrder -> {
//                    if (!originalOrder.canBeRedone()) {
//                        throw new InvalidOrderException("Order cannot be redone in current status: " + originalOrder.getStatus());
//                    }
//
//                    // Create new order based on original
//                    Order newOrder = Order.builder()
//                            .productId(originalOrder.getProductId())
//                            .productName(originalOrder.getProductName())
//                            .sellerId(originalOrder.getSellerId())
//                            .sellerName(originalOrder.getSellerName())
//                            .price(originalOrder.getPrice())
//                            .quantity(originalOrder.getQuantity())
//                            .userId(originalOrder.getUserId())
//                            .userName(originalOrder.getUserName())
//                            .shippingAddress(originalOrder.getShippingAddress())
//                            .paymentInfo(originalOrder.getPaymentInfo())
//                            .notes("Redone from order: " + orderId)
//                            .build();
//
//                    return createOrder(newOrder);
//                })
//                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
//    }
//
//    // Update order status with history
//    public Order updateOrderStatus(String orderId, OrderStatus newStatus, String updatedBy, String reason) {
//        return orderRepository.findById(orderId)
//                .map(order -> {
//                    validateStatusTransition(order.getStatus(), newStatus);
//
//                    order.setStatus(newStatus);
//                    order.setUpdatedAt(new Date());
//
//                    // Add to status history
//                    addStatusHistory(order, newStatus, updatedBy, reason);
//
//                    return orderRepository.save(order);
//                })
//                .orElseThrow(() -> new OrderNotFoundException("Order not found with id: " + orderId));
//    }
//
//    // Track order by tracking number
//    public Optional<Order> trackOrder(String trackingNumber) {
//        return orderRepository.findByTrackingNumber(trackingNumber);
//    }
//
//    // Get order statistics for user
//    public OrderStatistics getUserOrderStatistics(String userId) {
//        List<Order> userOrders = orderRepository.findByUserId(userId);
//        return calculateStatistics(userOrders);
//    }
//
//    // Get order statistics for seller
//    public OrderStatistics getSellerOrderStatistics(String sellerId) {
//        List<Order> sellerOrders = orderRepository.findBySellerId(sellerId);
//        return calculateStatistics(sellerOrders);
//    }
//
//    // Delete order (soft delete by marking as cancelled)
//    public void deleteOrder(String orderId, String deletedBy, String reason) {
//        cancelOrder(orderId, reason != null ? reason : "Order deleted", deletedBy);
//    }
//
//    // Helper methods
//    private void addStatusHistory(Order order, OrderStatus status, String updatedBy, String reason) {
//        OrderStatusHistory historyEntry = OrderStatusHistory.builder()
//                .status(status)
//                .timestamp(new Date())
//                .updatedBy(updatedBy)
//                .reason(reason)
//                .build();
//
//        if (order.getStatusHistory() == null) {
//            order.setStatusHistory(new ArrayList<>());
//        }
//        order.getStatusHistory().add(historyEntry);
//    }
//
//    private String generateTrackingNumber() {
//        return "TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
//    }
//
//    private OrderStatistics calculateStatistics(List<Order> orders) {
//        if (orders.isEmpty()) {
//            return OrderStatistics.builder().build();
//        }
//
//        long totalOrders = orders.size();
//        long pendingOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.PENDING ? 1 : 0).sum();
//        long confirmedOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.CONFIRMED ? 1 : 0).sum();
//        long processingOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.PROCESSING ? 1 : 0).sum();
//        long shippedOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.SHIPPED ? 1 : 0).sum();
//        long deliveredOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.DELIVERED ? 1 : 0).sum();
//        long cancelledOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.CANCELLED ? 1 : 0).sum();
//        long returnedOrders = orders.stream().mapToLong(o -> o.getStatus() == OrderStatus.RETURNED ? 1 : 0).sum();
//
//        double totalAmount = orders.stream().mapToDouble(Order::getTotalAmount).sum();
//        double averageOrderValue = totalAmount / totalOrders;
//
//        return OrderStatistics.builder()
//                .totalOrders(totalOrders)
//                .pendingOrders(pendingOrders)
//                .confirmedOrders(confirmedOrders)
//                .processingOrders(processingOrders)
//                .shippedOrders(shippedOrders)
//                .deliveredOrders(deliveredOrders)
//                .cancelledOrders(cancelledOrders)
//                .returnedOrders(returnedOrders)
//                .totalAmount(totalAmount)
//                .averageOrderValue(averageOrderValue)
//                .build();
//    }
//
//    private void validateOrder(Order order) {
//        if (order.getPrice() == null || order.getPrice() <= 0) {
//            throw new InvalidOrderException("Price must be greater than 0");
//        }
//        if (order.getQuantity() == null || order.getQuantity() <= 0) {
//            throw new InvalidOrderException("Quantity must be greater than 0");
//        }
//        if (order.getProductId() == null || order.getProductId().trim().isEmpty()) {
//            throw new InvalidOrderException("Product ID is required");
//        }
//        if (order.getUserId() == null || order.getUserId().trim().isEmpty()) {
//            throw new InvalidOrderException("User ID is required");
//        }
//        if (order.getSellerId() == null || order.getSellerId().trim().isEmpty()) {
//            throw new InvalidOrderException("Seller ID is required");
//        }
//    }
//
//    private void validateStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
//        if (currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.RETURNED) {
//            throw new InvalidOrderException("Cannot change status of cancelled or returned order");
//        }
//
//        if (currentStatus == OrderStatus.DELIVERED && newStatus != OrderStatus.RETURNED) {
//            throw new InvalidOrderException("Delivered order can only be returned");
//        }
//
//        if (currentStatus == OrderStatus.REFUNDED) {
//            throw new InvalidOrderException("Cannot change status of refunded order");
//        }
//    }
}
