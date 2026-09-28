package com.clickcart.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.model.ProviderType;
import com.clickcart.model.Role;
import com.clickcart.model.User;

class JwtUtilTest {

    private static final String SECRET = "test-secret-that-is-long-enough-for-hs256-signing";

    @Test
    void roundTripsProviderClaims() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 15);
        User user = user(Role.SERVICE_PROVIDER, ProviderType.BUSINESS);

        AuthenticatedUser parsed = jwtUtil.parseAccessToken(jwtUtil.generateAccessToken(user)).orElseThrow();

        assertEquals("u-1", parsed.id());
        assertEquals("u-1", parsed.getName());
        assertEquals("kamal@example.com", parsed.email());
        assertEquals(Role.SERVICE_PROVIDER, parsed.role());
        assertEquals(ProviderType.BUSINESS, parsed.providerType());
    }

    @Test
    void customerTokenHasNoProviderType() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 15);

        AuthenticatedUser parsed = jwtUtil.parseAccessToken(
                jwtUtil.generateAccessToken(user(Role.CUSTOMER, null))).orElseThrow();

        assertNull(parsed.providerType());
    }

    @Test
    void rejectsTokenSignedWithAnotherKey() {
        String foreign = new JwtUtil("another-secret-that-is-also-long-enough-000", 15)
                .generateAccessToken(user(Role.CUSTOMER, null));

        assertTrue(new JwtUtil(SECRET, 15).parseAccessToken(foreign).isEmpty());
    }

    @Test
    void rejectsExpiredToken() {
        JwtUtil expiring = new JwtUtil(SECRET, -1);

        assertTrue(expiring.parseAccessToken(expiring.generateAccessToken(user(Role.CUSTOMER, null))).isEmpty());
    }

    @Test
    void rejectsGarbageAndTamperedTokens() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 15);
        String token = jwtUtil.generateAccessToken(user(Role.CUSTOMER, null));
        String tampered = token.substring(0, token.length() - 2) + (token.endsWith("AA") ? "BB" : "AA");

        assertTrue(jwtUtil.parseAccessToken("not-a-jwt").isEmpty());
        assertTrue(jwtUtil.parseAccessToken(tampered).isEmpty());
    }

    @Test
    void shortSecretFallsBackToRandomKeyInsteadOfFailing() {
        JwtUtil jwtUtil = new JwtUtil("too-short", 15);

        assertTrue(jwtUtil.parseAccessToken(jwtUtil.generateAccessToken(user(Role.CUSTOMER, null))).isPresent());
    }

    private static User user(Role role, ProviderType providerType) {
        User user = new User();
        user.setId("u-1");
        user.setEmail("kamal@example.com");
        user.setRole(role);
        user.setProviderType(providerType);
        return user;
    }
}
