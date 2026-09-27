package com.clickcart.config;

import java.io.IOException;
import java.time.Clock;
import java.time.Duration;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.clickcart.exception.AuthErrorResponse;
import com.clickcart.util.FixedWindowRateLimiter;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Per-IP rate limits for abuse-prone auth endpoints (SRS SEC-007). Returns 429 with Retry-After.
 * Registered inside the security chain after CORS (see SecurityConfig) so browsers can read the 429.
 * Behind a reverse proxy, configure forwarded headers so getRemoteAddr() is the real client IP.
 */
@Component
public class AuthRateLimitFilter extends OncePerRequestFilter {

    record Rule(String method, String path, int limit, Duration window) {
    }

    static final List<Rule> RULES = List.of(
            new Rule("POST", "/api/auth/login", 10, Duration.ofMinutes(1)),
            new Rule("POST", "/api/auth/register", 10, Duration.ofMinutes(15)),
            new Rule("GET", "/api/auth/email-availability", 30, Duration.ofMinutes(1)),
            new Rule("POST", "/api/auth/refresh", 30, Duration.ofMinutes(1)));

    private final FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(Clock.systemUTC());
    private final ObjectMapper objectMapper;
    private final boolean enabled;

    public AuthRateLimitFilter(ObjectMapper objectMapper,
                               @Value("${AUTH_RATE_LIMIT_ENABLED:true}") boolean enabled) {
        this.objectMapper = objectMapper;
        this.enabled = enabled;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !enabled || findRule(request).isEmpty();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Rule rule = findRule(request).orElseThrow();
        String key = rule.path() + "|" + request.getRemoteAddr();
        long retryAfter = limiter.tryAcquire(key, rule.limit(), rule.window());

        if (retryAfter > 0) {
            response.setStatus(429);
            response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter));
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getOutputStream(), AuthErrorResponse.rateLimited(retryAfter));
            return;
        }
        filterChain.doFilter(request, response);
    }

    private static Optional<Rule> findRule(HttpServletRequest request) {
        String path = request.getRequestURI().substring(request.getContextPath().length());
        return RULES.stream()
                .filter(r -> r.method().equalsIgnoreCase(request.getMethod()) && r.path().equals(path))
                .findFirst();
    }
}
