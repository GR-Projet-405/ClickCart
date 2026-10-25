package com.clickcart.util;

import java.security.Principal;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.exception.UnauthorizedException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Resolves the currently authenticated customer's ID from Spring Security context
 * or the active HTTP request Authorization header.
 * Requests without a valid customer token throw UnauthorizedException (HTTP 401).
 */
@Component
public class CurrentCustomerResolver {

    /**
     * Default mock customer ID retained for initial data seeding.
     * Note: Must NEVER be returned as a fallback for unauthenticated requests.
     */
    public static final String DEV_MOCK_CUSTOMER_ID = "mock-customer-001";
    private static final String BEARER_PREFIX = "Bearer ";

    private final ObjectProvider<JwtUtil> jwtUtilProvider;

    public CurrentCustomerResolver(ObjectProvider<JwtUtil> jwtUtilProvider) {
        this.jwtUtilProvider = jwtUtilProvider;
    }

    /**
     * Resolves the current customer ID.
     * Extracts ID from authenticated JWT principal, or throws UnauthorizedException.
     * 
     * @return Current customer ID.
     * @throws UnauthorizedException if unauthenticated, empty/missing token, or invalid principal.
     */
    public String getCurrentCustomerId() {
        // 1. Check Spring Security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            if (principal instanceof AuthenticatedUser authUser) {
                return authUser.id();
            } else if (principal instanceof Principal p) {
                String name = p.getName();
                if (isValidCustomerId(name)) {
                    return name;
                }
            } else if (principal instanceof String principalStr) {
                if (isValidCustomerId(principalStr)) {
                    return principalStr;
                }
            }
        }

        // 2. Direct fallback check on HttpServletRequest Authorization header
        RequestAttributes attribs = RequestContextHolder.getRequestAttributes();
        if (attribs instanceof ServletRequestAttributes servletAttribs) {
            HttpServletRequest request = servletAttribs.getRequest();
            String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
            if (StringUtils.hasText(authHeader) && authHeader.startsWith(BEARER_PREFIX)) {
                String token = authHeader.substring(BEARER_PREFIX.length()).trim();
                JwtUtil jwtUtil = jwtUtilProvider.getIfAvailable();
                if (jwtUtil != null && StringUtils.hasText(token)) {
                    var userOpt = jwtUtil.parseAccessToken(token);
                    if (userOpt.isPresent()) {
                        return userOpt.get().id();
                    }
                }
            }
        }

        // 3. No valid authentication -> reject request with 401
        throw new UnauthorizedException("Full authentication is required to access this resource");
    }

    private boolean isValidCustomerId(String id) {
        return id != null
                && !id.isBlank()
                && !id.equalsIgnoreCase("anonymousUser")
                && !id.equalsIgnoreCase("dev-provider-09")
                && !id.equalsIgnoreCase(DEV_MOCK_CUSTOMER_ID);
    }
}

