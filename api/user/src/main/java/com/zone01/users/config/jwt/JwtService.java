
package com.zone01.users.config.jwt;

import com.zone01.users.model.JwtValidationResponse;
import com.zone01.users.model.Response;
import com.zone01.users.user.User;
import com.zone01.users.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class JwtService {
    @Value("${application.security.jwt.expiration}")
    private long expiration;
    @Value("${application.security.jwt.issuer}")
    private String issuer;

    private final JwtEncoder jwtEncoder;
    private final UserRepository userRepository;
    private final JwtDecoder jwtDecoder;
    private final UserDetailsService userDetailsService;


    public String generateToken(UserDetails userDetails) {
        Instant now = Instant.now();
        Map<String, Object> extraClaims = new HashMap<>();
        if (userDetails instanceof User user) {
            extraClaims.put("id", user.getId());
            extraClaims.put("name", user.getName());
            extraClaims.put("email", user.getEmail());
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("avatar", user.getAvatar());
        }

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(expiration))
                .subject(userDetails.getUsername())
                .claim("user", extraClaims)
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public JwtValidationResponse validateJwt(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return this.buildResponse("Missing or invalid Authorization header.", null);
        }

        try {
            String token = authHeader.substring(7);
            Jwt jwt = jwtDecoder.decode(token);

            if (isTokenExpired(jwt)) {
                return buildResponse( "Token has expired", null);
            }

            String email = jwt.getSubject();
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (!userRepository.existsByEmail(email)) {
                return buildResponse("User not found", null);
            }

            return this.buildResponse(null, userDetails);
        } catch (Exception e) {
            log.error("JWT verification failed: {}", e.getMessage());
            return this.buildResponse(e.getMessage(), null);
        }
    }

    private boolean isTokenExpired(Jwt jwt) {
        return jwt.getExpiresAt() == null || jwt.getExpiresAt().isBefore(Instant.now());
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