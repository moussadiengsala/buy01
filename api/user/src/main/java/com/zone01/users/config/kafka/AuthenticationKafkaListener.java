package com.zone01.users.config.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.users.user.User;
import com.zone01.users.model.Response;
import com.zone01.users.config.jwt.JwtService;
import com.zone01.users.model.JwtValidationResponse;
import com.zone01.users.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationKafkaListener {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final JwtService jwtService;

    // Function to extract and clean authorization header
    private String extractAuthHeader(Object value) {
        return  Optional.ofNullable(objectMapper.convertValue(value, String.class))
                .map(header -> header.startsWith("\"") && header.endsWith("\"")
                        ? header.substring(1, header.length() - 1).trim()
                        : header.trim())
                .orElse(null);
    }


    // Function to extract correlation ID
    private final Function<ConsumerRecord<String, Object>, byte[]> extractCorrelationId = record ->
            Optional.ofNullable(record.headers().lastHeader(KafkaHeaders.CORRELATION_ID))
                    .map(header -> header.value())
                    .orElse(null);

    // Supplier for error response
    private final Supplier<Response<UserDTO>> createErrorResponse = () ->
            Response.unauthorized("Error processing authentication request");

    // Main authentication processor
    private Response<UserDTO> authProcessor(String authHeader) {
        try {
            log.info("====== Checking the authentication header from kafka ========");
            JwtValidationResponse jwtValidationResponse = jwtService.validateJwt(authHeader);
            if (jwtValidationResponse.hasError()) {
                log.error("====== Failed checking the authentication header from kafka: {} ========", jwtValidationResponse.response().getMessage());
                return Response.mapper(jwtValidationResponse.response());
            }

            log.info("====== Successfully checking the authentication header from kafka ========");
            return Optional.of(jwtValidationResponse.userDetails())
                    .filter(User.class::isInstance)
                    .map(User.class::cast)
                    .map(User::toUserDTO)
                    .map(Response::ok)
                    .orElse(createErrorResponse.get());

        } catch (Exception e) {
            log.error("Error processing authentication request", e);
            var s = createErrorResponse.get();
            return createErrorResponse.get();
        }
    };

    // Response sender implementation
    private void responseSender(Response<Object> response, byte[] correlationId, String topic) {
        Message<Response<Object>> message = MessageBuilder
                .withPayload(response)
                .setHeader(KafkaHeaders.TOPIC, topic)
                .setHeader(KafkaHeaders.CORRELATION_ID, correlationId)
                .build();

        kafkaTemplate.send(message);
    };

    // Generic request handler using functional approach
    private final Consumer<ConsumerRecord<String, Object>> createRequestHandler(String responseTopic) {
        return record -> {
            log.info("====== Received authentication request from topic: {}, key: {} ======", record.topic(), record.key());

            String authHeader = extractAuthHeader(record.value());
            byte[] correlationId = extractCorrelationId.apply(record);
            responseSender(
                    Response.ok(authProcessor(authHeader).getData())
                    , correlationId, responseTopic);
        };
    }

    @KafkaListener(
            topics = "auth-request-product",
            groupId = "auth-group-product",
            containerFactory = "authKafkaListenerContainerFactory"
    )
    public void handleAuthRequestProduct(ConsumerRecord<String, Object> record) {
        createRequestHandler("auth-response-product").accept(record);
    }

    @KafkaListener(
            topics = "auth-request-media",
            groupId = "auth-group-media",
            containerFactory = "authKafkaListenerContainerFactory"
    )
    public void handleAuthRequestMedia(ConsumerRecord<String, Object> record) {
        createRequestHandler("auth-response-media").accept(record);
    }

    @KafkaListener(
            topics = "auth-request-order",
            groupId = "auth-group-order",
            containerFactory = "authKafkaListenerContainerFactory"
    )
    public void handleAuthRequestOrder(ConsumerRecord<String, Object> record) {
        createRequestHandler("auth-response-order").accept(record);
    }
}



//@Component
//@RequiredArgsConstructor
//@Slf4j
//public class AuthenticationKafkaListener {
//
//    private final KafkaTemplate<String, Object> kafkaTemplate;
//    private final ObjectMapper jacksonObjectMapper;
//    private final JwtService jwtService;
//
//    private static final String AUTH_RESPONSE_SUBSCRIPTIONS = "auth-response-subscriptions";
//    private static final String AUTH_RESPONSE_ANNOUNCEMENT = "auth-response-announcement";
//    private static final String AUTH_RESPONSE_MEMBERS = "auth-response-members";
//    private static final String AUTH_RESPONSE_PAYMENTS = "auth-response-payments";
//
//    private static final String AUTH_REQUEST_SUBSCRIPTIONS = "auth-request-subscriptions";
//    private static final String AUTH_REQUEST_ANNOUNCEMENT = "auth-request-announcement";
//    private static final String AUTH_REQUEST_MEMBERS = "auth-request-members";
//    private static final String AUTH_REQUEST_PAYMENTS = "auth-request-payments";
//
//    private static final String AUTH_GROUP_SUBSCRIPTIONS = "auth-group-subscriptions";
//    private static final String AUTH_GROUP_ANNOUNCEMENT = "auth-group-announcement";
//    private static final String AUTH_GROUP_MEMBERS = "auth-group-members";
//    private static final String AUTH_GROUP_PAYMENTS = "auth-group-payments";
//
//    @KafkaListener(topics = AUTH_REQUEST_SUBSCRIPTIONS, groupId = AUTH_GROUP_SUBSCRIPTIONS)
//    public void handleAuthRequestSubscriptions(ConsumerRecord<String, Object> record) {
//        this.handleAuthRequest(record, AUTH_RESPONSE_SUBSCRIPTIONS);
//    }
//
//    @KafkaListener(topics =AUTH_REQUEST_MEMBERS, groupId = AUTH_GROUP_MEMBERS)
//    public void handleAuthRequestMembers(ConsumerRecord<String, Object> record) {
//        this.handleAuthRequest(record, AUTH_RESPONSE_MEMBERS);
//    }
//
//    @KafkaListener(topics = AUTH_REQUEST_PAYMENTS, groupId = AUTH_GROUP_PAYMENTS)
//    public void handleAuthRequestPayment(ConsumerRecord<String, Object> record) {
//        this.handleAuthRequest(record, AUTH_RESPONSE_PAYMENTS);
//    }
//
//    @KafkaListener(topics = AUTH_REQUEST_ANNOUNCEMENT, groupId = AUTH_GROUP_ANNOUNCEMENT)
//    public void handleAuthRequestMedia(ConsumerRecord<String, Object> record) {
//        this.handleAuthRequest(record, AUTH_RESPONSE_ANNOUNCEMENT);
//    }
//
//    private void handleAuthRequest(ConsumerRecord<String, Object> record, String topicResponse) {
//        log.info("Received authentication request from topic: {}, key: {}", record.topic(), record.key());
//        String authHeader = jacksonObjectMapper.convertValue(record.value(), String.class);
//        String authorizationHeader = authHeader == null ? null : authHeader.startsWith("\"") && authHeader.endsWith("\"") ?
//                authHeader.substring(1, authHeader.length() - 1).trim() :
//                authHeader.trim();
//
//        var header = record.headers().lastHeader(KafkaHeaders.CORRELATION_ID);
//        byte[] correlationId = header != null ? header.value() : null;
//
//        try {
//
//            JwtValidationResponse jwtValidationResponse = jwtService.validateJwt(authorizationHeader);
//            if (jwtValidationResponse.hasError()) {
//                sendResponse(jwtValidationResponse.response(), correlationId, topicResponse);
//                return;
//            }
//
//            UserDTO userDTO = null;
//            if (jwtValidationResponse.userDetails() instanceof User user) {
//                userDTO = UserDTO.builder()
//                        .id(user.getId())
//                        .name(user.getName())
//                        .email(user.getEmail())
//                        .role(user.getRole())
//                        .avatar(user.getAvatar())
////                        .customer(user.getCustomer())
////                        .paymentMethod(user.getPaymentMethod())
//                        .build();
//            }
//
//            // Return successful response
//            sendResponse(buildResponse("Authentication successful", HttpStatus.OK, userDTO), correlationId, topicResponse);
//
//        } catch (Exception e) {
//            log.error("Error processing authentication request", e);
//            sendResponse(buildResponse("Error processing authentication request", HttpStatus.UNAUTHORIZED, null),
//                    correlationId, topicResponse);
//        }
//    }
//
//    private void sendResponse(Response<Object> response, byte[] correlationId, String topicResponse) {
//        Message<Response<Object>> message = MessageBuilder
//                .withPayload(response)
//                .setHeader(KafkaHeaders.TOPIC, topicResponse)
//                .setHeader(KafkaHeaders.CORRELATION_ID, correlationId)
//                .build();
//
//        kafkaTemplate.send(message);
//    }
//
//    private Response<Object> buildResponse(String message, HttpStatus status, Object data) {
//        return Response.<Object>builder()
//                .status(status.value())
//                .message(message)
//                .data(data)
//                .build();
//    }
//
//}