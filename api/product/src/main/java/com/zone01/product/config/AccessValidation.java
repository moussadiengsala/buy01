package com.zone01.product.config;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;
import org.springframework.kafka.requestreply.RequestReplyFuture;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.product.dto.UserDTO;
import com.zone01.product.model.Response;
import com.zone01.product.model.Role;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AccessValidation extends OncePerRequestFilter {
    private static final String USER = "currentUser";
    private final ObjectMapper jacksonObjectMapper;

    private final ReplyingKafkaTemplate<String, String, Response<?>> replyingAuthKafkaTemplate;
    private static final long REPLY_TIMEOUT_SECONDS = 30;
    private static final String REQUEST_TOPIC = "auth-request-product";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        log.info("====== Filtering request | url: {} | method: {} ======", request.getServletPath(), request.getMethod());
        if ("GET".equals(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            log.info("====== Sending the authorization header to the user service ======");
            ProducerRecord<String, String> record =
                    new ProducerRecord<>(REQUEST_TOPIC, request.getHeader("Authorization"));
            record.headers().add("X-Correlation-PRODUCT", UUID.randomUUID().toString().getBytes());
            record.headers().add("X-Correlation-Source", "product".getBytes());

            // Send and receive the response
            RequestReplyFuture<String, String, Response<?>> replyFuture =
                    replyingAuthKafkaTemplate.sendAndReceive(record);

            // Wait for response
            Response<?> userResponse = replyFuture.get(REPLY_TIMEOUT_SECONDS, TimeUnit.SECONDS).value();
            log.info("====== Receiving the response from user service ======");
            if (userResponse == null) {
                log.error("======== The user service returned a null response ======");
                setErrorResponse(response, HttpStatus.BAD_REQUEST.value(), null, "Having trouble to validate the token.");
                return;
            } else if (userResponse.getData() == null || userResponse.getStatus() != 200) {
                log.error("======== Failed to check the authorization header from kafka: {} ======", userResponse);
                setErrorResponse(response, userResponse.getStatus(), null, userResponse.getMessage());
                return;
            }

            log.info("====== The authorization has been check by user service successfully ======");
            UserDTO user = jacksonObjectMapper.convertValue(userResponse.getData(), UserDTO.class);
            if (user.getRole() != Role.SELLER) {
                setErrorResponse(response, HttpStatus.UNAUTHORIZED.value(), null, "Only user with role SELLER can perform this operation.");
                return;
            }
            request.setAttribute(USER, user);

        } catch (Exception e) {
            String errorMessage = e.getMessage();
            String jsonPart = extractJsonFromErrorMessage(errorMessage);
            log.error("====== Something went wrong while checking the authorization header from kafka: {} ======", jsonPart);

            if (jsonPart != null) {
                try {
                    // Step 2: Parse the JSON string into a Map or a specific Response class
                    Response<Map<String, Object>> jsonResponse = jacksonObjectMapper.readValue(jsonPart, Response.class);
                    setErrorResponse(response, jsonResponse.getStatus(), jsonResponse.getData(), jsonResponse.getMessage());
                    return;
                } catch (IOException ex) {
                    setErrorResponse(response, 400, null, errorMessage);
                    return;
                }
            } else {
                setErrorResponse(response, 400, null, errorMessage);
                return;
            }
        }

        // Continue with the filter chain if user validation was successful
        filterChain.doFilter(request, response);
    }

    public static UserDTO getCurrentUser(HttpServletRequest request) {
        return (UserDTO) request.getAttribute(USER);
    }

    private void setErrorResponse(HttpServletResponse response, int status, Map<String, Object> data, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Response<Object> errorResponse = Response.<Object>builder()
                .status(status)
                .message(message)
                .data(data)
                .build();
        jacksonObjectMapper.writeValue(response.getWriter(), errorResponse);
    }

    private String extractJsonFromErrorMessage(String errorMessage) {
        if (errorMessage == null) {
            return null;
        }

        // Regular expression to capture JSON inside the error message
        Pattern jsonPattern = Pattern.compile("(\\{.*\\})");
        Matcher matcher = jsonPattern.matcher(errorMessage);

        if (matcher.find()) {
            return matcher.group(1); // Return the matched JSON part
        }

        return null; // Return null if no JSON found
    }
}
