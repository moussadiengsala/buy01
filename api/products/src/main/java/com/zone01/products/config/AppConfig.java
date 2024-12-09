package com.zone01.products.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.products.products.UsersClient;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class AppConfig {
    private final UsersClient usersClient;
    private final ObjectMapper jacksonObjectMapper;

    @Bean
    public FilterRegistrationBean<AccessValidation> accessValidationFilter() {
        FilterRegistrationBean<AccessValidation> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new AccessValidation(usersClient, jacksonObjectMapper));
        registrationBean.addUrlPatterns("/api/v1/*"); // Specify your desired URL patterns
        return registrationBean;
    }
}
