package com.clickcart.dto.auth;

import java.security.Principal;

import com.clickcart.model.ProviderType;
import com.clickcart.model.Role;

/**
 * Security principal built from a verified JWT.
 * getName() returns the user id, so existing controllers that read Principal#getName() receive the user id.
 */
public record AuthenticatedUser(
        String id,
        String email,
        Role role,
        ProviderType providerType) implements Principal {

    @Override
    public String getName() {
        return id;
    }
}
