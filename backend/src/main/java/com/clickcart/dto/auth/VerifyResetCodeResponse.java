package com.clickcart.dto.auth;

/**
 * A single-use token that authorizes the final "set a new password" step.
 */
public record VerifyResetCodeResponse(
        String resetToken,
        long expiresInSeconds) {
}
