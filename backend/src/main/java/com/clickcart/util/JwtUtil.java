package com.clickcart.util;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.Optional;
import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.model.ProviderType;
import com.clickcart.model.Role;
import com.clickcart.model.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

/**
 * Issues and verifies short-lived access tokens (SRS IAM-008, SEC-003).
 *
 * Claims: sub = user id, email, role, providerType (providers only), ver = user token version.
 * The signing key comes from JWT_SECRET in backend/.env and is never committed to Git (SEC-014).
 */
@Component
public class JwtUtil {

    private static final Logger log = LoggerFactory.getLogger(JwtUtil.class);

    private static final String ISSUER = "clickcart";
    private static final int MIN_SECRET_BYTES = 32;

    private final SecretKey secretKey;
    private final Duration accessTokenTtl;

    public JwtUtil(
            @Value("${JWT_SECRET:}") String secret,
            @Value("${JWT_ACCESS_TOKEN_TTL_MINUTES:15}") long accessTokenTtlMinutes) {
        this.secretKey = Keys.hmacShaKeyFor(resolveKeyBytes(secret));
        this.accessTokenTtl = Duration.ofMinutes(accessTokenTtlMinutes);
    }

    private static byte[] resolveKeyBytes(String secret) {
        if (secret != null && secret.getBytes(StandardCharsets.UTF_8).length >= MIN_SECRET_BYTES) {
            return secret.getBytes(StandardCharsets.UTF_8);
        }
        log.warn("JWT_SECRET is missing or shorter than {} bytes. Using a random key for this run; "
                + "all tokens become invalid after a restart. Set JWT_SECRET in backend/.env.", MIN_SECRET_BYTES);
        byte[] random = new byte[48];
        new SecureRandom().nextBytes(random);
        return random;
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .issuer(ISSUER)
                .subject(user.getId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("ver", user.getTokenVersion())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessTokenTtl)));
        if (user.getProviderType() != null) {
            builder.claim("providerType", user.getProviderType().name());
        }
        return builder.signWith(secretKey).compact();
    }

    public long getAccessTokenTtlSeconds() {
        return accessTokenTtl.toSeconds();
    }

    /**
     * Verifies signature, issuer and expiry. Returns empty for any invalid, expired or malformed token.
     */
    public Optional<AuthenticatedUser> parseAccessToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .requireIssuer(ISSUER)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String providerType = claims.get("providerType", String.class);
            return Optional.of(new AuthenticatedUser(
                    claims.getSubject(),
                    claims.get("email", String.class),
                    Role.valueOf(claims.get("role", String.class)),
                    providerType != null ? ProviderType.valueOf(providerType) : null));
        } catch (JwtException | IllegalArgumentException | NullPointerException ex) {
            return Optional.empty();
        }
    }
}
