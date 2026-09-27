package com.clickcart.config;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.clickcart.util.JwtUtil;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Authenticates requests carrying "Authorization: Bearer <access token>".
 *
 * A valid token always wins. An invalid or expired token leaves the request unauthenticated
 * (protected endpoints return 401 so the client can refresh) and never falls back to the dev identity.
 *
 * Requests with no token use the development fallback only while CLICKCART_DEV_AUTH_FALLBACK=true,
 * so teammates' pages keep working until they send real tokens. It must be false in production.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    /**
     * Resolved lazily so @WebMvcTest slices (which do not load JwtUtil) can still create this filter.
     * If JwtUtil is absent, bearer tokens are simply not accepted.
     */
    private final ObjectProvider<JwtUtil> jwtUtil;
    private final boolean devAuthFallback;

    public JwtAuthenticationFilter(
            ObjectProvider<JwtUtil> jwtUtil,
            @Value("${CLICKCART_DEV_AUTH_FALLBACK:true}") boolean devAuthFallback) {
        this.jwtUtil = jwtUtil;
        this.devAuthFallback = devAuthFallback;
        if (devAuthFallback) {
            log.warn("DEV AUTH FALLBACK IS ENABLED: requests without a token are treated as a development user. "
                    + "Set CLICKCART_DEV_AUTH_FALLBACK=false in any shared or production environment.");
        }
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (StringUtils.hasText(authHeader) && authHeader.startsWith(BEARER_PREFIX)) {
            String token = authHeader.substring(BEARER_PREFIX.length()).trim();
            JwtUtil util = jwtUtil.getIfAvailable();
            if (util != null) {
                util.parseAccessToken(token).ifPresent(user -> setAuthentication(request, user,
                        List.of(new SimpleGrantedAuthority(user.role().authority()))));
            }
        } else if (devAuthFallback) {
            applyDevFallback(request);
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Development-only identity, unchanged from the behaviour teammates built against:
     * X-Dev-Role / X-Provider-Id headers if present, otherwise provider "dev-provider-09".
     */
    private void applyDevFallback(HttpServletRequest request) {
        String devRoleHeader = request.getHeader("X-Dev-Role");
        String devProviderHeader = request.getHeader("X-Provider-Id");

        String role = StringUtils.hasText(devRoleHeader) ? devRoleHeader : "ROLE_SERVICE_PROVIDER";
        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }
        String providerId = StringUtils.hasText(devProviderHeader) ? devProviderHeader : "dev-provider-09";

        setAuthentication(request, providerId, Collections.singletonList(new SimpleGrantedAuthority(role)));
    }

    private void setAuthentication(HttpServletRequest request, Object principal,
                                   List<SimpleGrantedAuthority> authorities) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
