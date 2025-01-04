package com.zone01.users.config.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;

import com.zone01.users.helpers.JwtValidator;
import com.zone01.users.model.JwtValidationResponse;
import com.zone01.users.user.User;
import com.zone01.users.model.Response;
import com.zone01.users.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;


@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationKafkaListener {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper jacksonObjectMapper;
    private final JwtValidator jwtValidator;

    private static final String AUTH_RESPONSE_PRODUCT = "auth-response-product";
    private static final String AUTH_RESPONSE_MEDIA = "auth-response-media";

    private static final String AUTH_REQUEST_PRODUCT = "auth-request-product";
    private static final String AUTH_REQUEST_MEDIA = "auth-request-media";

    private static final String AUTH_GROUP_PRODUCT = "auth-group-product";
    private static final String AUTH_GROUP_MEDIA = "auth-group-media";

    @KafkaListener(topics = AUTH_REQUEST_PRODUCT, groupId = AUTH_GROUP_PRODUCT)
    public void handleAuthRequestProduct(ConsumerRecord<String, Object> record) {
        this.handleAuthRequest(record, AUTH_RESPONSE_PRODUCT);
    }

    @KafkaListener(topics = AUTH_REQUEST_MEDIA, groupId = AUTH_GROUP_MEDIA)
    public void handleAuthRequestMedia(ConsumerRecord<String, Object> record) {
        this.handleAuthRequest(record, AUTH_RESPONSE_MEDIA);
    }

    private void handleAuthRequest(ConsumerRecord<String, Object> record, String topicResponse) {
        log.info("Received authentication request from topic: {}, key: {}", record.topic(), record.key());
        String authHeader = jacksonObjectMapper.convertValue(record.value(), String.class);
        String authorizationHeader = authHeader.startsWith("\"") && authHeader.endsWith("\"") ?
                authHeader.substring(1, authHeader.length() - 1).trim() :
                authHeader.trim();

        var header = record.headers().lastHeader(KafkaHeaders.CORRELATION_ID);
        byte[] correlationId = header != null ? header.value() : null;

        try {
            JwtValidationResponse jwtValidationResponse = jwtValidator.validateJwt(authorizationHeader);
            if (jwtValidationResponse.hasError()) {
                sendResponse(jwtValidationResponse.response(), correlationId, topicResponse);
                return;
            }

            UserDTO userDTO = null;
            if (jwtValidationResponse.userDetails() instanceof User user) {
                userDTO = UserDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .avatar(user.getAvatar())
                        .build();
            }

            // Return successful response
            sendResponse(buildResponse("Authentication successful", HttpStatus.OK, userDTO), correlationId, topicResponse);

        } catch (Exception e) {
            log.error("Error processing authentication request", e);
            sendResponse(buildResponse("Error processing authentication request", HttpStatus.UNAUTHORIZED, null),
                    correlationId, topicResponse);
        }
    }

    private void sendResponse(Response<Object> response, byte[] correlationId, String topicResponse) {
        Message<Response<Object>> message = MessageBuilder
                .withPayload(response)
                .setHeader(KafkaHeaders.TOPIC, topicResponse)
                .setHeader(KafkaHeaders.CORRELATION_ID, correlationId)
                .build();

        kafkaTemplate.send(message);
    }

    private Response<Object> buildResponse(String message, HttpStatus status, Object data) {
        return Response.<Object>builder()
                .status(status.value())
                .message(message)
                .data(data)
                .build();
    }

}