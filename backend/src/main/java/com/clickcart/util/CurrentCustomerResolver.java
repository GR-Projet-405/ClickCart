package com.clickcart.util;

import org.springframework.stereotype.Component;

/**
 * ============================================================================
 * DEVELOPMENT ONLY - MOCK CUSTOMER RESOLVER
 * ============================================================================
 * 
 * NOTICE FOR AUTHENTICATION TEAM MEMBER:
 * This component provides a temporary mechanism to identify the active customer
 * during the development stage when full login/registration/JWT is not yet built.
 * 
 * When real authentication (e.g. Spring Security / JWT / OAuth2) is integrated:
 * 1. Replace the implementation of getCurrentCustomerId() to extract the principal /
 *    subject / customer ID from SecurityContextHolder.getContext().getAuthentication().
 * 2. No changes will be required in the controller endpoints (GET / PUT /api/customers/me/profile)
 *    or frontend client code.
 * 
 * DO NOT USE THIS AS A FINAL AUTHENTICATION SOLUTION.
 * ============================================================================
 */
@Component
public class CurrentCustomerResolver {

    /**
     * Default mock customer ID used during development.
     */
    public static final String DEV_MOCK_CUSTOMER_ID = "mock-customer-001";

    /**
     * Resolves the current customer ID.
     * 
     * @return Current customer ID (mock-customer-001 during development).
     */
    public String getCurrentCustomerId() {
        // DEVELOPMENT ONLY: Return the mock customer ID.
        // TODO: Replace with authenticated user ID from SecurityContextHolder when Auth is integrated.
        return DEV_MOCK_CUSTOMER_ID;
    }
}
