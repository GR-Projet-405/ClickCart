package com.clickcart.dto.auth;

/**
 * Identical for every email address, so the response never reveals whether an account exists.
 * The timings drive the "code expires in" and "resend in" countdowns in the UI.
 */
public record ForgotPasswordResponse(
        long codeExpiresInSeconds,
        long resendAvailableInSeconds) {
}
