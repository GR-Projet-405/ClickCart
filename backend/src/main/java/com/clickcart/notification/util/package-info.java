package com.clickcart.notification.util;

/**
 * Utility seam for resolving the current authenticated user.
 *
 * <p>DEV-33 TEMPORARY INTEGRATION POINT — DO NOT MERGE AS-IS.
 *
 * <p>Identity & Access (DEV-01) is being built in parallel and is not yet merged.
 * Until real Spring Security authentication lands, the current user id is read
 * from the <code>X-User-Id</code> request header. This class is the single,
 * clearly-marked seam to swap for a <code>SecurityContextHolder</code> /
 * <code>@AuthenticationPrincipal</code> based resolver once DEV-01 is merged.
 * Replace {@link #currentUserId()} and {@link #currentRole()} only.
 */
public final class PackageInfo {
    private PackageInfo() {
    }
}