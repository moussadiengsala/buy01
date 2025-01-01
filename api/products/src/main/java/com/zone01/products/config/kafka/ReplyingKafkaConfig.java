package com.zone01.products.config.kafka;


import com.zone01.products.utils.Response;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.listener.ConcurrentMessageListenerContainer;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;

import java.time.Duration;

@Configuration
public class ReplyingKafkaConfig {

    @Bean
    public ReplyingKafkaTemplate<String, String, Response<?>> replyingKafkaTemplate(
            ProducerFactory<String, String> producerFactory,
            ConcurrentMessageListenerContainer<String, Response<?>> repliesContainer) {
        ReplyingKafkaTemplate<String, String, Response<?>> replyingTemplate =
                new ReplyingKafkaTemplate<>(producerFactory, repliesContainer);
            replyingTemplate.setDefaultReplyTimeout(Duration.ofSeconds(5));
        return replyingTemplate;
    }
}