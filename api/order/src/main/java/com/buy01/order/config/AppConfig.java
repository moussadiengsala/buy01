package com.buy01.order.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.product.config.AccessValidation;
import com.zone01.product.model.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;

@Configuration
@RequiredArgsConstructor
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class AppConfig {
    private final ObjectMapper jacksonObjectMapper;
    private final ReplyingKafkaTemplate<String, String, Response<?>> replyingAuthKafkaTemplate;

    @Bean
    public FilterRegistrationBean<AccessValidation> accessValidationFilter() {
        FilterRegistrationBean<AccessValidation> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new AccessValidation(jacksonObjectMapper, replyingAuthKafkaTemplate));
        registrationBean.addUrlPatterns("/api/v1/*"); // Specify your desired URL patterns
        return registrationBean;
    }

}
