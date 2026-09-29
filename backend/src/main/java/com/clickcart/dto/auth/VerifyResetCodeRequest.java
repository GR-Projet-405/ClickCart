package com.clickcart.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * POST /api/auth/verify-reset-code.
 */
public record VerifyResetCodeRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 254, message = "Email is too long")
        String email,

        @NotBlank(message = "Enter the 6-digit code")
        @Pattern(regexp = "^\\d{6}$", message = "Enter the 6-digit code")
        String code) {

    @Override
    public String toString() {
        return "VerifyResetCodeRequest[email=" + email + "]";
    }
}
