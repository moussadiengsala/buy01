package com.zone01.products.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.products.products.Role;
import com.zone01.products.products.UserDTO;
import com.zone01.products.products.UsersClient;
import com.zone01.products.utils.Response;
import feign.FeignException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.asm.TypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
@Slf4j  // For logging
public class AccessValidation extends OncePerRequestFilter {
    private static final String USER = "currentUser";
    private final UsersClient usersClient;
    private final ObjectMapper jacksonObjectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if ("GET".equals(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        // Check if the request has a valid Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            setErrorResponse(response, HttpStatus.UNAUTHORIZED.value(), null, "Missing or invalid Authorization header.");
            return;
        }

        try {
            // Validate token and fetch user permissions from the users service
            Response<UserDTO> userResponse = usersClient.validateAccess(authHeader);

            if (userResponse == null || userResponse.getData() == null) {
                log.warn("User validation failed: {}", userResponse != null ? userResponse.getMessage() : "No response from user service");
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "User validation failed or user does not have required permissions.");
                return;
            }

            request.setAttribute(USER, userResponse.getData());

        } catch (Exception e) {
            String errorMessage = e.getMessage();
            String jsonPart = extractJsonFromErrorMessage(errorMessage);

            if (jsonPart != null) {
                try {
                    // Step 2: Parse the JSON string into a Map or a specific Response class
                    Response<Map<String, Object>> jsonResponse = jacksonObjectMapper.readValue(jsonPart, Response.class);
                    setErrorResponse(response, jsonResponse.getStatus(), jsonResponse.getData(), jsonResponse.getMessage());
                    return;
                } catch (IOException ex) {
                    setErrorResponse(response, 400, null, errorMessage);
                    return;
                }
            } else {
                setErrorResponse(response, 400, null, errorMessage);
                return;
            }
        }

        // Continue with the filter chain if user validation was successful
        filterChain.doFilter(request, response);
    }

    public static UserDTO getCurrentUser(HttpServletRequest request) {
        return (UserDTO) request.getAttribute(USER);
    }

    private void setErrorResponse(HttpServletResponse response, int status, Map<String, Object> data, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Response<Object> errorResponse = Response.<Object>builder()
                .status(status)
                .message(message)
                .data(data)
                .build();
        jacksonObjectMapper.writeValue(response.getWriter(), errorResponse);
    }

    private String extractJsonFromErrorMessage(String errorMessage) {
        if (errorMessage == null) {
            return null;
        }

        // Regular expression to capture JSON inside the error message
        Pattern jsonPattern = Pattern.compile("(\\{.*\\})");
        Matcher matcher = jsonPattern.matcher(errorMessage);

        if (matcher.find()) {
            return matcher.group(1); // Return the matched JSON part
        }

        return null; // Return null if no JSON found
    }
}
