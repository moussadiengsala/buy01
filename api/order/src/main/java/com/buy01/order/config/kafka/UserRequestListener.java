//// AuthenticationKafkaListener.java
//package com.buy01.order.config.kafka;
//
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
//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class UserRequestListener {
//
//    private final KafkaTemplate<String, Object> kafkaTemplate;
//
//    private static final String PRODUCT_RESPONSE = "product-response-to-user";
//    private static final String USER_REQUEST = "user-request-to-product";
//    private static final String GROUP_ID = "user-to-product";
//    private final OrderService orderService;
//
//    @KafkaListener(topics = USER_REQUEST, groupId = GROUP_ID)
//    public void handleAuthRequest(ConsumerRecord<String, String> record) {
//        System.out.println("User request Listener" + record.value().toString());
//        String userId = record.value();
//        if (userId.startsWith("\"") && userId.endsWith("\"")) {
//            userId = userId.substring(1, userId.length() - 1);
//        }
//        userId = userId.trim();
//        byte[] correlationId = record.headers().lastHeader(KafkaHeaders.CORRELATION_ID).value();
//
//        try {
////            Response<Object> deleteResponse = productsService.deleteProductsByUserId(userId);
////            sendResponse(deleteResponse, correlationId);
//        } catch (Exception e) {
//            sendResponse(Response.<Object>builder()
//                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
//                    .message("Error processing getting user request")
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