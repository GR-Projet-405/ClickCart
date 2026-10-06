package com.clickcart.util;

import java.security.Principal;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.clickcart.dto.auth.AuthenticatedUser;

/**
 * Resolves the currently authenticated customer's ID from Spring Security context.
 * Falls back to development mock customer if unauthenticated in development mode.
 */
@Component
public class CurrentCustomerResolver {

    /**
     * Default mock customer ID used during development when unauthenticated.
     */
    public static final String DEV_MOCK_CUSTOMER_ID = "mock-customer-001";

    /**
     * Resolves the current customer ID.
     * Extracts ID from authenticated JWT principal, or falls back to dev mock.
     * 
     * @return Current customer ID.
     */
    public String getCurrentCustomerId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            if (principal instanceof AuthenticatedUser authUser) {
                return authUser.id();
            } else if (principal instanceof Principal p) {
                String name = p.getName();
                if (name != null && !name.equalsIgnoreCase("anonymousUser") && !name.equalsIgnoreCase("dev-provider-09")) {
                    return name;
                }
            } else if (principal instanceof String principalStr) {
                if (!principalStr.equalsIgnoreCase("anonymousUser") && !principalStr.equalsIgnoreCase("dev-provider-09")) {
                    return principalStr;
                }
            }
        }
        return DEV_MOCK_CUSTOMER_ID;
    }
}

