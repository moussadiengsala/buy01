package com.zone01.users.model;

import lombok.Builder;
import org.springframework.security.core.userdetails.UserDetails;

@Builder
public record JwtValidationResponse(Response<Object> response, UserDetails userDetails) {
    public boolean hasError() {
        return response != null;
    }
}
