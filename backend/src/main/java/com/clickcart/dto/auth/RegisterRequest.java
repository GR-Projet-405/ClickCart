package com.clickcart.dto.auth;

import com.clickcart.model.ProviderType;
import com.clickcart.model.Role;
import com.clickcart.util.PhoneNumbers;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * POST /api/auth/register (SRS IAM-001, IAM-005).
 * providerType is required when role is SERVICE_PROVIDER; this cross-field rule is checked in AuthService.
 */
public record RegisterRequest(

        @NotNull(message = "Choose whether you are signing up as a customer or a service provider")
        Role role,

        ProviderType providerType,

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Full name must be 2-100 characters")
        @Pattern(regexp = "^[\\p{L} .'-]+$", message = "Full name can contain only letters, spaces, . ' and -")
        String fullName,

        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = PhoneNumbers.SRI_LANKA_MOBILE_REGEX, message = "Enter a valid Sri Lankan mobile number")
        String phone,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 254, message = "Email is too long")
        String email,

        @NotBlank(message = "Password is required")
        @StrongPassword
        String password,

        @AssertTrue(message = "You must accept the Terms of Service and Privacy Policy")
        boolean acceptedTerms) {

    @Override
    public String toString() {
        // Never include the password in logs.
        return "RegisterRequest[role=" + role + ", providerType=" + providerType + ", email=" + email + "]";
    }
}
