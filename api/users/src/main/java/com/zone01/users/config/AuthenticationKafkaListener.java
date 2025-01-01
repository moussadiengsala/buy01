// AuthenticationKafkaListener.java
package com.zone01.users.config;

import com.zone01.users.user.User;
import com.zone01.users.user.UserService;
import com.zone01.users.utils.Response;
import com.zone01.users.utils.UserDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpStatus;

import java.util.Arrays;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuthenticationKafkaListener {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String AUTH_RESPONSE_PRODUCT = "auth-response-product";
    private static final String AUTH_RESPONSE_MEDIA = "auth-response-media";

    private static final String AUTH_REQUEST_PRODUCT = "auth-request-product";
    private static final String AUTH_REQUEST_MEDIA = "auth-request-media";

    private static final String AUTH_GROUP_PRODUCT = "auth-group-product";
    private static final String AUTH_GROUP_MEDIA = "auth-group-media";

    @KafkaListener(topics = AUTH_REQUEST_PRODUCT, groupId = AUTH_GROUP_PRODUCT)
    public void handleAuthRequestProduct(ConsumerRecord<String, String> record) {
        this.handleAuthRequest(record, AUTH_RESPONSE_PRODUCT);
    }

    @KafkaListener(topics = AUTH_REQUEST_MEDIA, groupId = AUTH_GROUP_MEDIA)
    public void handleAuthRequestMedia(ConsumerRecord<String, String> record) {
        this.handleAuthRequest(record, AUTH_RESPONSE_MEDIA);
    }

    private void handleAuthRequest(ConsumerRecord<String, String> record, String topicResponse) {
        log.info("Received authentication request");
        String authHeader = record.value();

        // Get correlation ID from the incoming record
        byte[] correlationId = record.headers().lastHeader(KafkaHeaders.CORRELATION_ID).value();

        try {
            // Validate auth header format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                sendResponse(Response.<Object>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .message("Missing or invalid Authorization header")
                        .data(null)
                        .build(), correlationId, topicResponse);
                return;
            }

            // Extract and validate JWT
            final String jwt = authHeader.substring(7);
            Map<String, Object> userEmailExtracted = jwtService.extractUsername(jwt);

            if (userEmailExtracted.get("error") != null) {
                sendResponse(Response.<Object>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .message((String) userEmailExtracted.get("error"))
                        .data(null)
                        .build(), correlationId, topicResponse);
                return;
            }

            final String userEmail = (String) userEmailExtracted.get("data");

            UserDetails userDetails;
            try {
                userDetails = userDetailsService.loadUserByUsername(userEmail);
            } catch (UsernameNotFoundException ex) {
                log.warn("User not found: {}", userEmail);
                sendResponse(Response.<Object>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .message("User not found")
                        .data(null)
                        .build(), correlationId, topicResponse);
                return;
            }

            if (!jwtService.isTokenValid(jwt, userDetails)) {
                sendResponse(Response.<Object>builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .message("Token invalid or expired")
                        .data(null)
                        .build(), correlationId, topicResponse);
                return;
            }

            // Convert UserDetails to UserDTO
            UserDTO userDTO = null;
            if (userDetails instanceof User user) {
                userDTO = UserDTO.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole())
                        .avatar(user.getAvatar())
                        .build();
            }

            // Return successful response
            sendResponse(Response.<Object>builder()
                    .status(HttpStatus.OK.value())
                    .message("Authentication successful")
                    .data(userDTO)
                    .build(), correlationId, topicResponse);

        } catch (Exception e) {
            log.error("Error processing authentication request", e);
            sendResponse(Response.<Object>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error processing authentication request")
                    .data(null)
                    .build(), correlationId, topicResponse);
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
}