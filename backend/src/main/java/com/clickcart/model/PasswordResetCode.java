package com.clickcart.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * One password-reset attempt (SRS IAM-003): a 6-digit code, then, once verified, a single-use reset token.
 * Only salted SHA-256 hashes are stored. Documents are purged automatically at purgeAt (TTL index in
 * {@link com.clickcart.config.AuthIndexInitializer}).
 */
@Document(collection = "password_reset_codes")
public class PasswordResetCode {

    @Id
    private String id;

    private String userId;
    private String codeSalt;
    private String codeHash;
    private int failedAttempts;
    private Instant codeExpiresAt;
    private Instant verifiedAt;

    private String resetTokenHash;
    private Instant resetTokenExpiresAt;
    private Instant usedAt;

    /** Set when a newer code is requested or the password has been reset. */
    private Instant invalidatedAt;

    private Instant createdAt;
    private Instant purgeAt;

    public PasswordResetCode() {
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

    public String getCodeSalt() {
        return codeSalt;
    }

    public void setCodeSalt(String codeSalt) {
        this.codeSalt = codeSalt;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public void setCodeHash(String codeHash) {
        this.codeHash = codeHash;
    }

    public int getFailedAttempts() {
        return failedAttempts;
    }

    public void setFailedAttempts(int failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public Instant getCodeExpiresAt() {
        return codeExpiresAt;
    }

    public void setCodeExpiresAt(Instant codeExpiresAt) {
        this.codeExpiresAt = codeExpiresAt;
    }

    public Instant getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(Instant verifiedAt) {
        this.verifiedAt = verifiedAt;
    }

    public String getResetTokenHash() {
        return resetTokenHash;
    }

    public void setResetTokenHash(String resetTokenHash) {
        this.resetTokenHash = resetTokenHash;
    }

    public Instant getResetTokenExpiresAt() {
        return resetTokenExpiresAt;
    }

    public void setResetTokenExpiresAt(Instant resetTokenExpiresAt) {
        this.resetTokenExpiresAt = resetTokenExpiresAt;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(Instant usedAt) {
        this.usedAt = usedAt;
    }

    public Instant getInvalidatedAt() {
        return invalidatedAt;
    }

    public void setInvalidatedAt(Instant invalidatedAt) {
        this.invalidatedAt = invalidatedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getPurgeAt() {
        return purgeAt;
    }

    public void setPurgeAt(Instant purgeAt) {
        this.purgeAt = purgeAt;
    }
}
