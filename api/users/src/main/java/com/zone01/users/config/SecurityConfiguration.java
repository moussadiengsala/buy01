package com.zone01.users.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/*
    When the security context is already populated (authentication is set), Spring Security's authentication mechanism works like this:

    1. If `SecurityContextHolder.getContext().getAuthentication()` is not null
    2. And the authentication is valid
    3. Then NO re-authentication will occur

    The flow is JwtAuthenticationFilter → UsernamePasswordAuthenticationFilter → Other Filters:
    ```
    Request → JWT Filter → Authentication Set → Skip Further Authentication → Process Request
    ```

    Key points:
    - One authentication per request
    - If authentication is already set, subsequent filters skip authentication
    - JWT filter sets the context for protected endpoints
    - No redundant authentication attempts

    This is why setting authentication in the security context is crucial, even in a stateless configuration.
    It allows Spring Security to recognize the request as already authenticated and proceed with authorization checks.

    * why populate the security context will bypasse UsernamePasswordAuthenticationFilter ?
    The bypass occurs due to the internal mechanism of Spring Security's filter chain. Here's a detailed explanation:
    public class UsernamePasswordAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
        @Override
        public Authentication attemptAuthentication(HttpServletRequest request,
                                                    HttpServletResponse response) {
            // This method only runs if NO authentication is present
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                // Attempt authentication
                return processAuthentication();
            }
            // If authentication exists, it's skipped
            return null;
        }
    }
* */

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfiguration {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(req ->
                        req.requestMatchers(new String[]{"/api/v1/users/auth/**", "/api/v1/users/avatar/**"})
                                .permitAll()
                                .anyRequest()
                                .authenticated()
                )
//                .exceptionHandling(ex -> ex.accessDeniedHandler(accessDeniedHandler))
                // This line configures how the session is managed in your application.
                // SessionCreationPolicy.STATELESS: This means that the application will not create or use an HTTP session to store the user's security context.
                // Stateless: Every request must be independently authenticated because no session state is maintained between request
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                /*
                 * This specifies which authentication provider is responsible for verifying user credentials and providing the authenticated user's details.
                 * Client Request → Authentication Manager → Authentication Provider → UserDetailsService → Password Encoding → Authentication Success/Failure
                 */
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

