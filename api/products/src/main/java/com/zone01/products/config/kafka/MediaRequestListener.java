// AuthenticationKafkaListener.java
package com.zone01.products.config.kafka;

import com.zone01.products.products.Products;
import com.zone01.products.products.ProductsService;
import com.zone01.products.utils.Response;

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

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class MediaRequestListener {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private static final String PRODUCT_RESPONSE = "product-response-to-media";
    private final ProductsService productsService;

    @KafkaListener(topics = "media-request-to-product", groupId = "product-group")
    public void handleAuthRequest(ConsumerRecord<String, String> record) {
        System.out.println("Media request Listener" + record.value().toString());

        String productId = record.value();
        byte[] correlationId = record.headers().lastHeader(KafkaHeaders.CORRELATION_ID).value();

        try {
            Optional<Products> productsOptional = productsService.getProductById(productId);
            if (productsOptional.isEmpty()) {
                sendResponse(Response.<Object>builder()
                        .status(HttpStatus.NOT_FOUND.value())
                        .message("the product is not found.")
                        .data(null)
                        .build(), correlationId);
                return;
            }

            Products product = productsOptional.get();
            sendResponse(Response.<Object>builder()
                    .status(HttpStatus.OK.value())
                    .message("success")
                    .data(product)
                    .build(), correlationId);
        } catch (Exception e) {
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
                .setHeader(KafkaHeaders.TOPIC, PRODUCT_RESPONSE)
                .setHeader(KafkaHeaders.CORRELATION_ID, correlationId)
                .build();

        kafkaTemplate.send(message);
    }
}