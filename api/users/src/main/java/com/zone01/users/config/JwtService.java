
package com.zone01.users.config;

import com.zone01.users.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    public Map<String, Object> extractUsername(String token) {
        Map<String, Object> response = new HashMap<>();

        try {
           String username = extractClaim(token, Claims::getSubject);
           response.put("data", username);
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }
        return response;
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Map<String, Object> response = extractAllClaims(token);

        // Check if there was an error during claim extraction
        if (response.get("error") != null) {
            throw new IllegalArgumentException((String) response.get("error"));
        }

        Claims claims = (Claims) response.get("data");
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(
            Map<String, Object> extraClaims,
            UserDetails userDetails
    ) {
        return buildToken(userDetails, jwtExpiration);
    }

    public String generateRefreshToken(
            UserDetails userDetails
    ) {
        return buildToken(userDetails, refreshExpiration);
    }

    private String buildToken(
            UserDetails userDetails,
            long expiration
    ) {
        Map<String, Object> extraClaims = new HashMap<>();
        if (userDetails instanceof User user) {
            extraClaims.put("id", user.getId());
            extraClaims.put("name", user.getName());
            extraClaims.put("email", user.getEmail());
            extraClaims.put("role", user.getRole().name());
            extraClaims.put("avatar", user.getAvatar());
        }

        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSignInKey())
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        Map<String, Object> response = extractUsername(token);
        if (response.get("error") != null) return false;

        String username = (String) response.get("data");
        return username != null && (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        Map<String, Object> response = extractExpiration(token);
        if (response.get("error") != null) return false;

        Date expiration = (Date) response.get("data");
        return expiration.before(new Date());
    }

    private Map<String, Object> extractExpiration(String token) {
        Map<String, Object> response = new HashMap<>();

        try {
            Date expirationDate = extractClaim(token, Claims::getExpiration);
            response.put("data", expirationDate);
        } catch (Exception e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    private Map<String, Object> extractAllClaims(String token) {
        Map<String, Object> response = new HashMap<>();
        try {
            Claims claims = Jwts
                    .parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            response.put("data", claims);
        } catch (JwtException e) {
            response.put("error", e.getMessage());
        }

        return response;
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}