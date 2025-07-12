package com.buy01.order.order;

import com.buy01.order.model.PaymentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    List<Order> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Order> findByUserIdAndPaymentStatusOrderByCreatedAtDesc(String userId, PaymentStatus paymentStatus);
    Optional<Order> findByStripePaymentIntentId(String paymentIntentId);
    List<Order> findByPaymentStatusAndCreatedAtBefore(PaymentStatus paymentStatus, Date createdBefore);

    // Basic queries
//    List<Order> findByUserId(String userId);
//    List<Order> findBySellerId(String sellerId);
//    List<Order> findByProductId(String productId);
//    List<Order> findByStatus(OrderStatus status);
//    List<Order> findByUserIdAndStatus(String userId, OrderStatus status);
//    List<Order> findBySellerIdAndStatus(String sellerId, OrderStatus status);
//
//    // Paginated queries
//    Page<Order> findByUserId(String userId, Pageable pageable);
//    Page<Order> findBySellerId(String sellerId, Pageable pageable);
//    Page<Order> findByStatus(OrderStatus status, Pageable pageable);
//
//    // Search queries
//    @Query("{'$or': [" +
//            "{'productName': {$regex: ?0, $options: 'i'}}, " +
//            "{'userName': {$regex: ?0, $options: 'i'}}, " +
//            "{'sellerName': {$regex: ?0, $options: 'i'}}, " +
//            "{'trackingNumber': {$regex: ?0, $options: 'i'}}, " +
//            "{'notes': {$regex: ?0, $options: 'i'}}" +
//            "]}")
//    Page<Order> searchOrders(String searchText, Pageable pageable);
//
//    @Query("{'userId': ?0, '$or': [" +
//            "{'productName': {$regex: ?1, $options: 'i'}}, " +
//            "{'trackingNumber': {$regex: ?1, $options: 'i'}}, " +
//            "{'notes': {$regex: ?1, $options: 'i'}}" +
//            "]}")
//    Page<Order> searchUserOrders(String userId, String searchText, Pageable pageable);
//
//    @Query("{'sellerId': ?0, '$or': [" +
//            "{'productName': {$regex: ?1, $options: 'i'}}, " +
//            "{'userName': {$regex: ?1, $options: 'i'}}, " +
//            "{'trackingNumber': {$regex: ?1, $options: 'i'}}, " +
//            "{'notes': {$regex: ?1, $options: 'i'}}" +
//            "]}")
//    Page<Order> searchSellerOrders(String sellerId, String searchText, Pageable pageable);
//
//    // Date range queries
//    @Query("{'createdAt': {$gte: ?0, $lte: ?1}}")
//    Page<Order> findOrdersByDateRange(Date startDate, Date endDate, Pageable pageable);
//
//    @Query("{'userId': ?0, 'createdAt': {$gte: ?1, $lte: ?2}}")
//    Page<Order> findUserOrdersByDateRange(String userId, Date startDate, Date endDate, Pageable pageable);
//
//    @Query("{'sellerId': ?0, 'createdAt': {$gte: ?1, $lte: ?2}}")
//    Page<Order> findSellerOrdersByDateRange(String sellerId, Date startDate, Date endDate, Pageable pageable);
//
//    // Amount range queries
//    @Query("{'$expr': {'$and': [" +
//            "{'$gte': [{'$multiply': ['$price', '$quantity']}, ?0]}, " +
//            "{'$lte': [{'$multiply': ['$price', '$quantity']}, ?1]}" +
//            "]}}")
//    Page<Order> findOrdersByAmountRange(Double minAmount, Double maxAmount, Pageable pageable);
//
//    // Status queries
//    @Query("{'status': {$in: ?0}}")
//    Page<Order> findByStatusIn(List<OrderStatus> statuses, Pageable pageable);
//
//    // Tracking number
//    Optional<Order> findByTrackingNumber(String trackingNumber);
//
//    // Count queries
//    Long countByUserId(String userId);
//    Long countBySellerId(String sellerId);
//    Long countByStatus(OrderStatus status);
//    Long countByUserIdAndStatus(String userId, OrderStatus status);
//    Long countBySellerIdAndStatus(String sellerId, OrderStatus status);
//
//    // Existence checks
//    boolean existsByUserIdAndProductId(String userId, String productId);
//    boolean existsByTrackingNumber(String trackingNumber);
}