package com.zone01.products.config.kafka;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic productTopic() {
        return TopicBuilder.name("product-topic")
//                .partitions(3)
//                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic productReplyTopic() {
        return TopicBuilder.name("product-reply-topic")
//                .partitions(3)
//                .replicas(1)
                .build();
    }
}