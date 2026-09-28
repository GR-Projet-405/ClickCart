package com.clickcart.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * POST /api/auth/reset-password.
 */
public record ResetPasswordRequest(

        @NotBlank(message = "Your reset session has expired. Please start again.")
        @Size(max = 128, message = "Invalid reset token")
        String resetToken,

        @NotBlank(message = "New password is required")
        @StrongPassword
        String newPassword) {

    @Override
    public String toString() {
        return "ResetPasswordRequest[]";
    }
}
