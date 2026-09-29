package com.clickcart.dto.auth;

import java.time.Instant;

import com.clickcart.model.AccountStatus;
import com.clickcart.model.ProviderType;
import com.clickcart.model.Role;
import com.clickcart.model.User;

/**
 * Public view of the authenticated user. Never contains the password hash or security counters.
 */
public record UserResponse(
        String id,
        String email,
        String fullName,
        String phone,
        Role role,
        ProviderType providerType,
        AccountStatus status,
        Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole(),
                user.getProviderType(),
                user.getStatus(),
                user.getCreatedAt());
    }
}
