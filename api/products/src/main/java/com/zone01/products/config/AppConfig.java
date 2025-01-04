package com.zone01.products.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.products.model.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.kafka.requestreply.ReplyingKafkaTemplate;

@Configuration
@RequiredArgsConstructor
// This configuration ensures that pagination data will be serialized in a stable, consistent format.
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class AppConfig {
//    private final UsersClient usersClient;
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
