package com.zone01.users.config.jwt;

import com.zone01.users.model.Response;
import lombok.Builder;
import org.springframework.security.core.userdetails.UserDetails;

@Builder
public record JwtValidationResponse(Response<Object> response, UserDetails userDetails) {
    public boolean hasError() {
        return response != null;
    }
}
