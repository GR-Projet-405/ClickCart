package com.clickcart.dto.auth;
import jakarta.validation.constraints.*;
public record ChangePasswordRequest(
 @NotBlank @Size(max=128) String currentPassword,
 @NotBlank @StrongPassword String newPassword,
 @NotBlank @Size(max=64) String confirmPassword) {
 @Override public String toString() { return "ChangePasswordRequest[]"; }
}
