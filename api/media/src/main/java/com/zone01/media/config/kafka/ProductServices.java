package com.zone01.media.config.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.media.config.AccessValidation;
import com.zone01.media.dto.ProductsDTO;
import com.zone01.media.dto.UserDTO;
import com.zone01.media.model.Response;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;
import org.springframework.kafka.requestreply.RequestReplyFuture;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ProductServices {
    private final ObjectMapper jacksonObjectMapper;

    private final ReplyingKafkaTemplate<String, String, Response<?>> replyingProductKafkaTemplate;
    private static final long REPLY_TIMEOUT_SECONDS = 30;

    private static final String MEDIA_REQUEST = "media-request-to-product";

    public Response<Object> getProductByID(String productId, HttpServletRequest request) {
        try {
            // Create a ProducerRecord with reply topic header
            ProducerRecord<String, String> record =
                    new ProducerRecord<>(MEDIA_REQUEST, productId);

            record.headers().add("X-Correlation-ID", UUID.randomUUID().toString().getBytes());
            record.headers().add("X-Correlation-Source", "media".getBytes());

            // Send and receive the response
            RequestReplyFuture<String, String, Response<?>> replyFuture =
                    replyingProductKafkaTemplate.sendAndReceive(record);

            // Wait for response
            Response<?> productResponse = replyFuture.get(REPLY_TIMEOUT_SECONDS, TimeUnit.SECONDS).value();

            if (productResponse == null || productResponse.getData() == null || productResponse.getStatus() != 200) {
                return buildResponse(productResponse.getStatus(), null, productResponse.getMessage());
            }

            ProductsDTO product = jacksonObjectMapper.convertValue(productResponse.getData(), ProductsDTO.class);
            UserDTO currentUser = AccessValidation.getCurrentUser(request);
            if (!currentUser.getId().equals(product.getUserID())) {
                return Response.<Object>builder()
                        .status(HttpStatus.FORBIDDEN.value())
                        .message("You can only perform this operation to your product.")
                        .data(null)
                        .build();
            }

            return buildResponse(HttpStatus.OK.value(), product, productResponse.getMessage());
        } catch (Exception e) {
            String errorMessage = e.getMessage();
            String jsonPart = extractJsonFromErrorMessage(errorMessage);

            if (jsonPart != null) {
                try {
                    // Step 2: Parse the JSON string into a Map or a specific Response class
                    Response<Map<String, Object>> jsonResponse = jacksonObjectMapper.readValue(jsonPart, Response.class);
                    return buildResponse(jsonResponse.getStatus(), jsonResponse.getData(), jsonResponse.getMessage());
                } catch (IOException ex) {
                    return buildResponse(400, null, errorMessage);
                }
            } else {
                return buildResponse(400, null, errorMessage);
            }
        }
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

    private <T> Response<T> buildResponse(int status, T data, String message) {
        return Response.<T>builder()
                .status(status)
                .message(message)
                .data(data)
                .build();
    }
}
