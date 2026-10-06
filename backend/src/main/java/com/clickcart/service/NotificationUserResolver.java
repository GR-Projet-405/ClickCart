package com.clickcart.service;

import java.security.Principal;
import java.util.Collection;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.exception.AccessForbiddenException;
import com.clickcart.model.Role;

@Component
public class NotificationUserResolver {

    public record CurrentUser(String id, Role role) {
    }

    public CurrentUser requireCurrentUser(Principal principal) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (principal == null || authentication == null || !authentication.isAuthenticated()) {
            throw new AccessForbiddenException("Not authenticated");
        }

        Object inner = authentication.getPrincipal();
        if (inner instanceof AuthenticatedUser user) {
            return new CurrentUser(user.id(), user.role());
        }

        String userId = inner instanceof String value ? value : principal.getName();
        Role role = roleFromAuthorities(authentication.getAuthorities());
        if (userId == null || userId.isBlank() || role == null) {
            throw new AccessForbiddenException("Not authenticated");
        }
        return new CurrentUser(userId, role);
    }

    private Role roleFromAuthorities(Collection<? extends GrantedAuthority> authorities) {
        if (authorities == null) {
            return null;
        }
        for (GrantedAuthority authority : authorities) {
            String value = authority.getAuthority();
            if (value != null && value.startsWith("ROLE_")) {
                try {
                    return Role.valueOf(value.substring("ROLE_".length()));
                } catch (IllegalArgumentException ignored) {
                    // A non-ClickCart authority is ignored.
                }
            }
        }
        return null;
    }
}
