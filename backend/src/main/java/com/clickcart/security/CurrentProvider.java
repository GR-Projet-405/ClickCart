package com.clickcart.security;

import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

/** Provider identity comes only from Spring Security's verified principal. */
public final class CurrentProvider {
    private CurrentProvider() {}

    public static String id() {
        return id(SecurityContextHolder.getContext().getAuthentication());
    }

    public static String id(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof org.springframework.security.authentication.AnonymousAuthenticationToken) {
            throw new UnauthorizedException("Sign in to your provider account to continue");
        }
        if (authentication.getAuthorities().stream().noneMatch(a -> "ROLE_SERVICE_PROVIDER".equals(a.getAuthority()))) {
            throw new ForbiddenException("A service provider account is required");
        }
        Object principal = authentication.getPrincipal();
        String id = principal instanceof AuthenticatedUser user ? user.id()
                : principal instanceof Jwt jwt ? jwt.getSubject() : authentication.getName();
        if (id == null || id.isBlank() || "anonymousUser".equals(id)) {
            throw new UnauthorizedException("Provider identity is missing");
        }
        return id;
    }

    public static void requireOwner(String providerId) {
        if (!id().equals(providerId)) {
            throw new ForbiddenException("You can only manage your own provider data");
        }
    }
}
