package com.buy01.order.order;

import com.buy01.order.model.OrderStatus;
import com.buy01.order.model.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * Find orders by seller ID
     */
    List<Order> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    /**
     * Find orders by seller ID with pagination
     */
    Page<Order> findBySellerIdOrderByCreatedAtDesc(String sellerId, Pageable pageable);

    /**
     * Find orders by user ID with pagination
     */
    Page<Order> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    /**
     * Find orders by status
     */
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    /**
     * Find orders by payment status
     */
    List<Order> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus);

    /**
     * Find orders by user ID and status
     */
    List<Order> findByUserIdAndStatusOrderByCreatedAtDesc(String userId, OrderStatus status);

    /**
     * Find orders by seller ID and status
     */
    List<Order> findBySellerIdAndStatusOrderByCreatedAtDesc(String sellerId, OrderStatus status);

    /**
     * Find orders by date range
     */
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(Date startDate, Date endDate);

    /**
     * Find orders by user ID and date range
     */
    List<Order> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(String userId, Date startDate, Date endDate);

    /**
     * Find orders by seller ID and date range
     */
    List<Order> findBySellerIdAndCreatedAtBetweenOrderByCreatedAtDesc(String sellerId, Date startDate, Date endDate);

    /**
     * Count orders by user ID
     */
    long countByUserId(String userId);

    /**
     * Count orders by seller ID
     */
    long countBySellerId(String sellerId);

    /**
     * Count orders by user ID and status
     */
    long countByUserIdAndStatus(String userId, OrderStatus status);

    /**
     * Count orders by seller ID and status
     */
    long countBySellerIdAndStatus(String sellerId, OrderStatus status);

    /**
     * Find orders by seller ID and payment status completed
     */
    List<Order> findBySellerIdAndPaymentStatusOrderByCreatedAtDesc(String sellerId, PaymentStatus paymentStatus);

    /**
     * Complex search query for orders with multiple filters
     * This uses MongoDB query annotations for complex filtering
     */
    @Query("{ " +
            "$and: [" +
            "  { $or: [ " +
            "    { 'userId': ?0 }, " +
            "    { 'sellerId': ?0 } " +
            "  ] }, " +
            "  { $or: [ " +
            "    { ?1: { $exists: false } }, " +
            "    { 'orderItems.productName': { $regex: ?1, $options: 'i' } }, " +
            "    { 'id': { $regex: ?1, $options: 'i' } } " +
            "  ] }, " +
            "  { $or: [ " +
            "    { ?2: { $exists: false } }, " +
            "    { 'status': ?2 } " +
            "  ] }, " +
            "  { $or: [ " +
            "    { ?3: { $exists: false } }, " +
            "    { 'paymentStatus': ?3 } " +
            "  ] }, " +
            "  { $or: [ " +
            "    { ?4: { $exists: false } }, " +
            "    { 'createdAt': { $gte: ?4 } } " +
            "  ] }, " +
            "  { $or: [ " +
            "    { ?5: { $exists: false } }, " +
            "    { 'createdAt': { $lte: ?5 } } " +
            "  ] } " +
            "] }")
    List<Order> findOrdersWithFilters(
            @Param("userId") String userId,
            @Param("keyword") String keyword,
            @Param("status") OrderStatus status,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate
    );

    /**
     * Search orders by product name (case-insensitive)
     */
    @Query("{ 'orderItems.productName': { $regex: ?0, $options: 'i' } }")
    List<Order> findByProductNameContainingIgnoreCase(String productName);

    /**
     * Search orders by order ID (partial match)
     */
    @Query("{ 'id': { $regex: ?0, $options: 'i' } }")
    List<Order> findByOrderIdContaining(String orderId);

    /**
     * Find orders that can be cancelled (not delivered, not cancelled)
     */
    @Query("{ 'userId': ?0, 'status': { $nin: ['DELIVERED', 'CANCELLED'] } }")
    List<Order> findCancellableOrdersByUserId(String userId);

    /**
     * Find orders that can be refunded (completed payment but not delivered)
     */
    @Query("{ 'userId': ?0, 'paymentStatus': 'COMPLETED', 'status': { $nin: ['DELIVERED', 'CANCELLED'] } }")
    List<Order> findRefundableOrdersByUserId(String userId);

    /**
     * Find orders with completed payment for earnings calculation
     */
    @Query("{ 'sellerId': ?0, 'paymentStatus': 'COMPLETED' }")
    List<Order> findCompletedOrdersBySellerId(String sellerId);

    /**
     * Find orders with completed payment for spending calculation
     */
    @Query("{ 'userId': ?0, 'paymentStatus': 'COMPLETED' }")
    List<Order> findCompletedOrdersByUserId(String userId);

    /**
     * Find recent orders (last 30 days)
     */
    @Query("{ 'createdAt': { $gte: ?0 } }")
    List<Order> findRecentOrders(Date thirtyDaysAgo);

    /**
     * Find orders by multiple user IDs (for batch operations)
     */
    List<Order> findByUserIdInOrderByCreatedAtDesc(List<String> userIds);

    /**
     * Find orders by multiple seller IDs (for batch operations)
     */
    List<Order> findBySellerIdInOrderByCreatedAtDesc(List<String> sellerIds);

    /**
     * Find orders with specific total amount range
     */
    List<Order> findByTotalAmountBetweenOrderByCreatedAtDesc(Double minAmount, Double maxAmount);

    /**
     * Find orders that need follow-up (pending for too long)
     */
    @Query("{ 'status': 'PENDING', 'createdAt': { $lt: ?0 } }")
    List<Order> findPendingOrdersOlderThan(Date date);

    /**
     * Find orders with incomplete payment older than specified date
     */
    @Query("{ 'paymentStatus': 'INCOMPLETE', 'createdAt': { $lt: ?0 } }")
    List<Order> findIncompleteOrdersOlderThan(Date date);
}
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
