package com.zone01.users.config.kafka;


import com.zone01.users.model.Response;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;

import java.time.Duration;

@Configuration
public class ReplyingKafkaConfig {
    @Bean
    public ReplyingKafkaTemplate<String, Object, Response<?>> replyingProductKafkaTemplate(
            ProducerFactory<String, Object> producerFactory,
            ConcurrentMessageListenerContainer<String, Response<?>> repliesProductContainer) {
        ReplyingKafkaTemplate<String, Object, Response<?>> replyingTemplate =
                new ReplyingKafkaTemplate<>(producerFactory, repliesProductContainer);
        replyingTemplate.setDefaultReplyTimeout(Duration.ofSeconds(5));
        return replyingTemplate;
    }
}