package com.zone01.users.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.users.utils.Response;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

/*
* This execute on once (OncePerRequestFilter) every request.
* Check the token if it's valide it will store it on the context security otherwise response is unauthorized.
*/
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ObjectMapper jacksonObjectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (request.getServletPath().contains("/api/v1/users/auth") || request.getServletPath().contains("/api/v1/users/avatar")) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            setErrorResponse(response, "Missing or invalid Authorization header.");
            return;
        }

        final String jwt = authHeader.substring(7);
        Map<String, Object> userEmailExtracted = jwtService.extractUsername(jwt);
        if (userEmailExtracted.get("error") != null) {
            setErrorResponse(response, (String) userEmailExtracted.get("error"));
            return;
        }

        final String userEmail = (String) userEmailExtracted.get("data");

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails;
            try {
                userDetails = this.userDetailsService.loadUserByUsername(userEmail);
            } catch (UsernameNotFoundException e) {
                setErrorResponse(response, "Invalid token: User's data not found.");
                return;
            } catch (Exception e) {
                setErrorResponse(response, "An error occurred while loading user details.");
                return;
            }

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            } else {
                setErrorResponse(response, "Token invalid or expired.");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void setErrorResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        Response<Object> errorResponse = Response.<Object>builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .message(message)
                .data(null)
                .build();
        jacksonObjectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
