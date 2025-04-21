// AuthenticationKafkaListener.java
package com.zone01.media.config.kafka;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.media.media.MediaService;
import com.zone01.media.model.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductRequestListener {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String MEDIA_RESPONSE = "media-response-to-product";
    private static final String PRODUCT_REQUEST = "product-request-to-media";
    private static final String GROUP_ID = "product-to-media";
    private final MediaService mediaService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = PRODUCT_REQUEST, groupId = GROUP_ID)
    public void handleProductRequest(ConsumerRecord<String, Object> record) {
        System.out.println("Product request Listener" + record.value().toString());
        byte[] correlationId = record.headers().lastHeader(KafkaHeaders.CORRELATION_ID).value();
        try {
            String rawJson = record.value().toString(); // This is a JSON array in string form
            List<String> productIds = objectMapper.readValue(
                    rawJson, new TypeReference<List<String>>() {}
            );

            Response<Object> deleteResponse = mediaService.deleteMediaByProductIds(productIds);
            sendResponse(deleteResponse, correlationId);
        }  catch (Exception e) {
            System.out.println(e.getMessage());
            sendResponse(Response.<Object>builder()
                    .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .message("Error processing getting product request")
                    .data(null)
                    .build(), correlationId);
        }
    }

    private void sendResponse(Response<Object> response, byte[] correlationId) {
        Message<Response<Object>> message = MessageBuilder
                .withPayload(response)
                .setHeader(KafkaHeaders.TOPIC, MEDIA_RESPONSE)
                .setHeader(KafkaHeaders.CORRELATION_ID, correlationId)
                .build();

        kafkaTemplate.send(message);
    }
}