package com.clickcart.dto.auth;

/**
 * Returned by register and login (and refresh from Step 3).
 * expiresIn is the access-token lifetime in seconds.
 */
public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserResponse user) {

    public static AuthResponse bearer(String accessToken, long expiresIn, UserResponse user) {
        return new AuthResponse(accessToken, "Bearer", expiresIn, user);
    }
}
