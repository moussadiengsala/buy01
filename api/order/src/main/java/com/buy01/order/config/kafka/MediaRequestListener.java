//// AuthenticationKafkaListener.java
//package com.buy01.order.config.kafka;
//
//import com.buy01.order.order.Order;
//import com.buy01.order.order.OrderService;
//import com.buy01.order.model.Response;
//import lombok.RequiredArgsConstructor;
//import lombok.extern.slf4j.Slf4j;
//import org.apache.kafka.clients.consumer.ConsumerRecord;
//import org.springframework.http.HttpStatus;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.kafka.core.KafkaTemplate;
//import org.springframework.kafka.support.KafkaHeaders;
//import org.springframework.messaging.Message;
//import org.springframework.messaging.support.MessageBuilder;
//import org.springframework.stereotype.Component;
//
//import java.util.Optional;
//
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class MediaRequestListener {
//
//    private final KafkaTemplate<String, Object> kafkaTemplate;
//
//    private static final String MEDIA_REQUEST = "media-request-to-product";
//    private static final String PRODUCT_RESPONSE = "product-response-to-media";
//    private static final String GROUP_ID = "media-to-product";
//
//    private final OrderService orderService;
//
//    @KafkaListener(topics = MEDIA_REQUEST, groupId = GROUP_ID)
//    public void handleAuthRequest(ConsumerRecord<String, Object> record) {
//        System.out.println("Media request Listener" + record.value().toString());
//
//        String productId = (String) record.value();
//        if (productId.startsWith("\"") && productId.endsWith("\"")) {
//            productId = productId.substring(1, productId.length() - 1);
//        }
//        productId = productId.trim();
//        byte[] correlationId = record.headers().lastHeader(KafkaHeaders.CORRELATION_ID).value();
//
//        try {
////            Optional<Order> productsOptional = productsService.getProductById(productId);
////            if (productsOptional.isEmpty()) {
////                sendResponse(Response.<Object>builder()
////                        .status(HttpStatus.NOT_FOUND.value())
////                        .message("the product is not found.")
////                        .data(null)
////                        .build(), correlationId);
////                return;
////            }
////
////            Products product = productsOptional.get();
////            sendResponse(Response.<Object>builder()
////                    .status(HttpStatus.OK.value())
////                    .message("success")
////                    .data(product)
////                    .build(), correlationId);
//        } catch (Exception e) {
//            sendResponse(Response.<Object>builder()
//                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
//                    .message("Error processing getting product request")
//                    .data(null)
//                    .build(), correlationId);
//        }
//    }
//
//    private void sendResponse(Response<Object> response, byte[] correlationId) {
//        Message<Response<Object>> message = MessageBuilder
//                .withPayload(response)
//                .setHeader(KafkaHeaders.TOPIC, PRODUCT_RESPONSE)
//                .setHeader(KafkaHeaders.CORRELATION_ID, correlationId)
//                .build();
//
//        kafkaTemplate.send(message);
//    }
//}