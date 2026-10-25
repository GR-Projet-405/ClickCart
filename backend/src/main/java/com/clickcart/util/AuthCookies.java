package com.clickcart.util;

import java.time.Duration;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import com.clickcart.service.RefreshTokenService.IssuedRefreshToken;

/**
 * Builds the refresh-token cookie. It is httpOnly (JavaScript cannot read it) and scoped to /api/auth,
 * so it is only sent to the refresh and logout endpoints.
 * Without "remember me" it is a browser-session cookie; the server-side token still expires after 24 hours.
 */
@Component
public class AuthCookies {

    public static final String REFRESH_COOKIE = "cc_refresh";
    private static final String COOKIE_PATH = "/api/auth";

    private final boolean secure;
    private final String sameSite;

    public AuthCookies(
            @Value("${AUTH_COOKIE_SECURE:false}") boolean secure,
            @Value("${AUTH_COOKIE_SAME_SITE:Lax}") String sameSite) {
        this.secure = secure;
        this.sameSite = sameSite;
    }

    public ResponseCookie refreshCookie(IssuedRefreshToken token) {
        ResponseCookie.ResponseCookieBuilder builder = base(token.rawToken());
        if (token.rememberMe()) {
            builder.maxAge(Duration.between(Instant.now(), token.expiresAt()));
        }
        return builder.build();
    }

    public ResponseCookie clearedRefreshCookie() {
        return base("").maxAge(0).build();
    }

    private ResponseCookie.ResponseCookieBuilder base(String value) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(COOKIE_PATH);
    }
}
