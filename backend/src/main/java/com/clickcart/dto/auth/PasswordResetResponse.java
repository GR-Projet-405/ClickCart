package com.clickcart.dto.auth;

import java.time.Instant;

/**
 * Shown on the "Password updated" screen.
 */
public record PasswordResetResponse(Instant changedAt) {
}
