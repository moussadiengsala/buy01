package com.zone01.users.config.kafka;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.kafka")
@Data
public class KafkaConfigProperties {
    private Consumer consumer = new Consumer();
    private Producer producer = new Producer();
    private Topics topics = new Topics();

    @Data
    public static class Consumer {
        private String groupId = "auth-service";
        private int maxPollRecords = 500;
        private int sessionTimeout = 30000;
        private int concurrency = 3;
        private boolean enableAutoCommit = false;
        private String autoOffsetReset = "earliest";
    }

    @Data
    public static class Producer {
        private int retries = 3;
        private int batchSize = 16384;
        private int lingerMs = 1;
        private String acks = "all";
        private boolean enableIdempotence = true;
        private String compressionType = "snappy";
    }

    @Data
    public static class Topics {
        private String authRequestPrefix = "auth-request-";
        private String authResponsePrefix = "auth-response-";
        private String authGroupPrefix = "auth-group-";
    }
}
