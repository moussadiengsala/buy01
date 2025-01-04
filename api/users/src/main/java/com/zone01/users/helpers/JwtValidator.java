package com.zone01.users.helpers;

import com.zone01.users.config.JwtService;
import com.zone01.users.model.JwtValidationResponse;
import com.zone01.users.model.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtValidator {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public JwtValidationResponse validateJwt(String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return this.buildResponse("Missing or invalid Authorization header.", null);
        }

        String jwt = authHeader.substring(7);
        Map<String, Object> userEmailExtracted = jwtService.extractUsername(jwt);
        if (userEmailExtracted.get("error") != null) {
            return this.buildResponse((String) userEmailExtracted.get("error"), null);
        }

        String userEmail = (String) userEmailExtracted.get("data");
        try {
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);
            if (!jwtService.isTokenValid(jwt, userDetails)) {
                return this.buildResponse("Token invalid or expired.", null);
            }
            return this.buildResponse(null, userDetails);
        } catch (UsernameNotFoundException e) {
            return this.buildResponse("User not found: " + e.getMessage(), null);
        } catch (Exception e) {
            return this.buildResponse(e.getMessage(), null);
        }
    }

    private JwtValidationResponse buildResponse(String message, UserDetails userDetails) {
        Response<Object> response = userDetails == null ?
                Response.builder()
                        .status(HttpStatus.UNAUTHORIZED.value())
                        .message(message)
                        .build() : null;
        return JwtValidationResponse.builder()
                .response(response)
                .userDetails(userDetails)
                .build();
    }
}
