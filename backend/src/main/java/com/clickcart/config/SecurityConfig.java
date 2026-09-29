package com.clickcart.config;

import com.clickcart.exception.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import com.clickcart.util.JwtUtil;

import java.util.List;

@Configuration
@EnableWebSecurity
@Import(JwtUtil.class)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthRateLimitFilter authRateLimitFilter;
    private final ObjectMapper objectMapper;
    private final List<String> allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthRateLimitFilter authRateLimitFilter,
            ObjectMapper objectMapper,
            @Value("${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://127.0.0.1:5173}") List<String> allowedOrigins) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authRateLimitFilter = authRateLimitFilter;
        this.objectMapper = objectMapper;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            ErrorResponse err = new ErrorResponse(
                                    HttpServletResponse.SC_UNAUTHORIZED,
                                    "Unauthorized",
                                    authException.getMessage() != null ? authException.getMessage()
                                            : "Full authentication is required to access this resource");
                            objectMapper.writeValue(response.getOutputStream(), err);
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            ErrorResponse err = new ErrorResponse(
                                    HttpServletResponse.SC_FORBIDDEN,
                                    "Forbidden",
                                    accessDeniedException.getMessage() != null ? accessDeniedException.getMessage()
                                            : "Access denied: insufficient permissions");
                            objectMapper.writeValue(response.getOutputStream(), err);
                        }))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health", "/api/public/**").permitAll()
                        // DEV-01: public authentication endpoints
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login",
                                "/api/auth/refresh", "/api/auth/logout", "/api/auth/forgot-password",
                                "/api/auth/verify-reset-code", "/api/auth/reset-password")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/auth/email-availability").permitAll()
                        .requestMatchers("/api/services", "/api/services/**").permitAll()
                        .requestMatchers("/api/provider/service-areas", "/api/provider/service-areas/**").permitAll()
                        .requestMatchers("/api/service-areas/**").permitAll()
                        .requestMatchers("/api/provider/**").hasRole("SERVICE_PROVIDER")
                        .anyRequest().authenticated())
                // DEV-01: rate limits run after CORS so browsers can read 429 responses
                .addFilterAfter(authRateLimitFilter, CorsFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * DEV-01: BCrypt with cost 12 for password hashing (SRS SEC-002).
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    /**
     * DEV-01: credentials (the refresh cookie) are only allowed from the configured
     * frontend origins,
     * set with CORS_ALLOWED_ORIGINS (comma-separated).
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(allowedOrigins.stream().map(String::trim).toList());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Registering the properly configured 'configuration' object
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
