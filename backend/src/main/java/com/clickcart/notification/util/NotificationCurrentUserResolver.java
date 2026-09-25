package com.clickcart.notification.util;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.util.StringUtils;

/**
 * Resolves the current authenticated user from the incoming request.
 *
 * <p>DEV-33 TEMPORARY INTEGRATION POINT — DO NOT MERGE AS-IS.
 *
 * <p>Identity & Access (DEV-01) is being built in parallel and is not yet
 * merged. Until real Spring Security authentication lands, the current user
 * id is read from the <code>X-User-Id</code> request header. This class is the
 * single, clearly-marked seam to swap for a
 * <code>SecurityContextHolder</code> / <code>@AuthenticationPrincipal</code>
 * based resolver once DEV-01 is merged.
 *
 * <p>To replace later, swap the body of {@link #currentUserId(HttpServletRequest)}
 * and {@link #currentRole(HttpServletRequest)} only — the controller and
 * service signatures stay unchanged.
 */
public interface NotificationCurrentUserResolver {

    String HEADER_NAME = "X-User-Id";
    String ROLE_HEADER_NAME = "X-User-Role";

    /**
     * Resolve the current user id from the request. Returns {@code null} when
     * no authenticated user can be determined.
     */
    String currentUserId(HttpServletRequest request);

    /**
     * Resolve the current user's role from the request. Returns {@code null}
     * when unknown.
     */
    String currentRole(HttpServletRequest request);

    /**
     * Default header-based implementation used until DEV-01 auth lands.
     */
    final class HeaderResolver implements NotificationCurrentUserResolver {
        @Override
        public String currentUserId(HttpServletRequest request) {
            if (request == null) {
                return null;
            }
            String id = request.getHeader(HEADER_NAME);
            return StringUtils.hasText(id) ? id.trim() : null;
        }

        @Override
        public String currentRole(HttpServletRequest request) {
            if (request == null) {
                return null;
            }
            String role = request.getHeader(ROLE_HEADER_NAME);
            return StringUtils.hasText(role) ? role.trim() : null;
        }
    }
}