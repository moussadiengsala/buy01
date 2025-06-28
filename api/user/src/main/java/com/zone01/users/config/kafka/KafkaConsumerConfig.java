package com.zone01.users.config.kafka;

import com.zone01.users.model.Response;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.util.backoff.FixedBackOff;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Supplier;

@Configuration
public class KafkaConsumerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:auth-service}")
    private String defaultGroupId;

    @Value("${spring.kafka.consumer.max-poll-records:500}")
    private int maxPollRecords;

    @Value("${spring.kafka.consumer.session-timeout:30000}")
    private int sessionTimeout;

    private final Supplier<Map<String, Object>> baseConsumerConfig = () -> new HashMap<>(Map.of(
        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers,
        ConsumerConfig.GROUP_ID_CONFIG, defaultGroupId,
        ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest",
        ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false,
        ConsumerConfig.MAX_POLL_RECORDS_CONFIG, maxPollRecords,
        ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, sessionTimeout,

        // Error handling deserializers
        ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class,
        ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class,
        ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class,
        ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class
    ));

    private final Supplier<Map<String, Object>> jsonDeserializerConfig = () -> {
        Map<String, Object> config = baseConsumerConfig.get();

        // JsonDeserializer-specific configurations
        config.put(JsonDeserializer.TRUSTED_PACKAGES, "com.zone01.*");
        config.put(JsonDeserializer.TYPE_MAPPINGS, "response:com.zone01.users.model.Response");
        config.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
        config.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.zone01.users.model.Response");

        return config;
    };

    @Bean
    public DefaultKafkaConsumerFactory<String, Object> authConsumerFactory() {
        return new DefaultKafkaConsumerFactory<>(
                baseConsumerConfig.get(),
                new StringDeserializer(),
                new ErrorHandlingDeserializer<>(new JsonDeserializer<>(Object.class))
        );
    }

    @Bean
    public DefaultKafkaConsumerFactory<String, Response<?>> responseConsumerFactory() {
        JsonDeserializer<Response<?>> deserializer = new JsonDeserializer<>();
        deserializer.addTrustedPackages("com.zone01.*");
        deserializer.setUseTypeHeaders(false);

        return new DefaultKafkaConsumerFactory<>(
                jsonDeserializerConfig.get(),
                new StringDeserializer(),
                new ErrorHandlingDeserializer<>(deserializer)
        );
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> authKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(authConsumerFactory());

        // Configure error handling
        factory.setCommonErrorHandler(createErrorHandler());

        // Configure container properties
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.RECORD);
        factory.getContainerProperties().setSyncCommits(true);
        factory.setConcurrency(3);

        return factory;
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Response<?>> responseKafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Response<?>> factory =
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(responseConsumerFactory());
        factory.setCommonErrorHandler(createErrorHandler());
        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.RECORD);

        return factory;
    }

    private DefaultErrorHandler createErrorHandler() {
        // Retry 3 times with 1 second delay
        return new DefaultErrorHandler(new FixedBackOff(1000L, 3));
    }
}











//@Configuration
//public class KafkaConsumer {
//
//    @Value("${spring.kafka.bootstrap-servers}")
//    private String bootstrapServers;
//
//    public Map<String, Object> consumerConfig() {
//        Map<String, Object> properties = new HashMap<>();
//        properties.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
//        properties.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
//        properties.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class);
//        properties.put(ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class);
//        properties.put(ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class);
//        properties.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
//
//        // JsonDeserializer-specific configurations
//        properties.put(JsonDeserializer.TRUSTED_PACKAGES, "com.zone01.*");
//        properties.put(JsonDeserializer.TYPE_MAPPINGS, "response:com.zone01.users.model.Response");
//        properties.put(JsonDeserializer.USE_TYPE_INFO_HEADERS, false);
//        properties.put(JsonDeserializer.VALUE_DEFAULT_TYPE, "com.zone01.users.model.Response");
//
//        return properties;
//    }
//
//    @Bean
//    public DefaultKafkaConsumerFactory<String, Response> replyConsumerFactory() {
//        return new DefaultKafkaConsumerFactory<>(
//                consumerConfig(),
//                new StringDeserializer(),
//                new JsonDeserializer<>(Response.class).trustedPackages("com.zone01.*")
//        );
//    }
//
//    @Bean
//    public ConcurrentKafkaListenerContainerFactory<String, Response<?>> listenerContainerFactory() {
//        ConcurrentKafkaListenerContainerFactory<String, Response<?>> factory =
//                new ConcurrentKafkaListenerContainerFactory<>();
//        factory.setConsumerFactory(replyConsumerFactory());
//        return factory;
//    }
//}
