package com.clickcart.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * POST /api/auth/login (SRS IAM-002).
 * rememberMe extends the refresh-token lifetime ("Keep me signed in for 30 days"); used from Step 3.
 */
public record LoginRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 254, message = "Email is too long")
        String email,

        @NotBlank(message = "Password is required")
        @Size(max = 128, message = "Password is too long")
        String password,

        boolean rememberMe) {

    @Override
    public String toString() {
        return "LoginRequest[email=" + email + ", rememberMe=" + rememberMe + "]";
    }
}
