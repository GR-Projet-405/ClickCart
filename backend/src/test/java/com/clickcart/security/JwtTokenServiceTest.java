package com.clickcart.security;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class JwtTokenServiceTest {

    @Test
    void roundTripProviderToken() {
        JwtTokenService jwt = new JwtTokenService("clickcart-local-dev-secret-please-change-32", 31536000);
        String token = jwt.createToken("provider-a", "Kavinda Silva");
        ProviderPrincipal principal = jwt.parse(token);
        assertEquals("provider-a", principal.providerId());
        assertEquals("SERVICE_PROVIDER", principal.role());
        assertEquals("Kavinda Silva", principal.displayName());
    }

    @Test
    void stableDemoTokensParse() {
        JwtTokenService jwt = new JwtTokenService("clickcart-local-dev-secret-please-change-32", 31536000);
        String providerA = jwt.createToken("provider-a", "Kavinda Silva", 1893456000L);
        String providerB = jwt.createToken("provider-b", "Provider B", 1893456000L);
        assertEquals("provider-a", jwt.parse(providerA).providerId());
        assertEquals("provider-b", jwt.parse(providerB).providerId());
        System.out.println("PROVIDER_A_TOKEN=" + providerA);
        System.out.println("PROVIDER_B_TOKEN=" + providerB);
    }
}
