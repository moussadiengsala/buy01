package com.zone01.users.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@AllArgsConstructor
public class ResponseAccessDenied implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {

            // Create a custom response for access denied
            Response<String> customResponse = Response.<String>builder()
                    .status(HttpStatus.FORBIDDEN.value())
                    .data(null)
                    .message("Access denied!!!!!!!!!!!!!: " + accessDeniedException.getMessage())
                    .build();

            // Write the custom response to the output
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json");
            response.getWriter().write(new ObjectMapper().writeValueAsString(customResponse));
            response.getWriter().flush();

    }
}
