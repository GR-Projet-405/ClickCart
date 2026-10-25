package com.clickcart.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Server-side record of a refresh token (SRS IAM-009). Only the SHA-256 hash is stored, never the raw token.
 * Indexes (unique tokenHash, userId, TTL on expiresAt) are created by
 * {@link com.clickcart.config.AuthIndexInitializer}.
 */
@Document(collection = "refresh_tokens")
public class RefreshToken {

    public static final String REASON_ROTATED = "ROTATED";
    public static final String REASON_LOGOUT = "LOGOUT";
    public static final String REASON_REUSE_DETECTED = "REUSE_DETECTED";
    public static final String REASON_PASSWORD_RESET = "PASSWORD_RESET";
    public static final String REASON_ACCOUNT_UNAVAILABLE = "ACCOUNT_UNAVAILABLE";

    @Id
    private String id;

    private String userId;
    private String tokenHash;
    private boolean rememberMe;
    private Instant expiresAt;
    private Instant createdAt;
    private Instant revokedAt;
    private String revokedReason;

    public RefreshToken() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public boolean isRememberMe() {
        return rememberMe;
    }

    public void setRememberMe(boolean rememberMe) {
        this.rememberMe = rememberMe;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(Instant revokedAt) {
        this.revokedAt = revokedAt;
    }

    public String getRevokedReason() {
        return revokedReason;
    }

    public void setRevokedReason(String revokedReason) {
        this.revokedReason = revokedReason;
    }
}
