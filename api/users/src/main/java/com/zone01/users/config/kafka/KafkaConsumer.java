package com.zone01.users.config.kafka;

import com.zone01.users.model.Response;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.*;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConsumer {
    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;
    private static final String PRODUCTS_RESPONSE = "product-response-to-user";
    private static final String GROUP_ID = "user-to-product";

    public Map<String, Object> consumerConfig() {
        Map<String, Object> properties = new HashMap<>();
        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
        properties.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);
        properties.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        // JsonDeserializer-specific configurations
        properties.put(JsonDeserializer.TRUSTED_PACKAGES, "com.zone01.*");
        properties.put(JsonDeserializer.TYPE_MAPPINGS, "response:com.zone01.users.model.Response");
        properties.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        properties.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.zone01.users.model.Response");

        return properties;
    }

    @Bean
    public DefaultKafkaConsumerFactory<String, Response> replyConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(
                consumerConfig(),
                new StringDeserializer(),
                new JsonDeserializer<>(Response.class).trustedPackages("com.zone01.*")
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Response<?>> listenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Response<?>> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(replyConsumerFactory());
        return factory;
    }

    @Bean
    public ConcurrentMessageListenerContainer<String, Response<?>> repliesProductContainer(
            ConcurrentKafkaListenerContainerFactory<String, Response<?>> factory) {
        ConcurrentMessageListenerContainer<String, Response<?>> container =
                factory.createContainer(PRODUCTS_RESPONSE);
        container.getContainerProperties().setGroupId(GROUP_ID);
        container.getContainerProperties().setMissingTopicsFatal(false);
        return container;
    }

}
