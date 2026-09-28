package com.clickcart.service;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clickcart.dto.auth.ForgotPasswordResponse;
import com.clickcart.dto.auth.PasswordResetResponse;
import com.clickcart.dto.auth.VerifyResetCodeResponse;
import com.clickcart.exception.AuthException;
import com.clickcart.model.AccountStatus;
import com.clickcart.model.PasswordResetCode;
import com.clickcart.model.RefreshToken;
import com.clickcart.model.User;
import com.clickcart.repository.UserRepository;
import com.clickcart.util.SecureTokens;

/**
 * Password recovery with a 6-digit code (SRS IAM-003): Email -> Verify code -> New password.
 *
 * - The forgot-password response is identical for every email, so it never reveals whether an account exists.
 * - Codes expire after 10 minutes, allow 5 wrong tries, and a new one can be requested after 60 seconds.
 * - A verified code is exchanged for a single-use reset token; resetting the password clears any lockout
 *   and signs the user out of every device.
 */
@Service
public class PasswordResetService {

    private static final Logger audit = LoggerFactory.getLogger("clickcart.audit.auth");
    private static final SecureRandom RANDOM = new SecureRandom();
    /** Documents are kept a little longer than any token inside them, then MongoDB deletes them (TTL). */
    private static final Duration PURGE_AFTER = Duration.ofHours(1);

    private final MongoTemplate mongo;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokens;
    private final PasswordResetCodeSender codeSender;
    private final Duration codeTtl;
    private final Duration resendCooldown;
    private final int maxCodeAttempts;
    private final Duration resetTokenTtl;
    private final Clock clock;

    @Autowired
    public PasswordResetService(
            MongoTemplate mongo,
            UserRepository users,
            PasswordEncoder passwordEncoder,
            RefreshTokenService refreshTokens,
            PasswordResetCodeSender codeSender,
            @Value("${AUTH_RESET_CODE_TTL_MINUTES:10}") long codeTtlMinutes,
            @Value("${AUTH_RESET_RESEND_COOLDOWN_SECONDS:60}") long resendCooldownSeconds,
            @Value("${AUTH_RESET_CODE_MAX_ATTEMPTS:5}") int maxCodeAttempts,
            @Value("${AUTH_RESET_TOKEN_TTL_MINUTES:10}") long resetTokenTtlMinutes) {
        this(mongo, users, passwordEncoder, refreshTokens, codeSender, Duration.ofMinutes(codeTtlMinutes),
                Duration.ofSeconds(resendCooldownSeconds), maxCodeAttempts, Duration.ofMinutes(resetTokenTtlMinutes),
                Clock.systemUTC());
    }

    PasswordResetService(MongoTemplate mongo, UserRepository users, PasswordEncoder passwordEncoder,
                         RefreshTokenService refreshTokens, PasswordResetCodeSender codeSender,
                         Duration codeTtl, Duration resendCooldown, int maxCodeAttempts,
                         Duration resetTokenTtl, Clock clock) {
        this.mongo = mongo;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokens = refreshTokens;
        this.codeSender = codeSender;
        this.codeTtl = codeTtl;
        this.resendCooldown = resendCooldown;
        this.maxCodeAttempts = maxCodeAttempts;
        this.resetTokenTtl = resetTokenTtl;
        this.clock = clock;
    }

    public ForgotPasswordResponse requestCode(String rawEmail) {
        ForgotPasswordResponse response =
                new ForgotPasswordResponse(codeTtl.toSeconds(), resendCooldown.toSeconds());

        User user = users.findByEmail(AuthService.normalizeEmail(rawEmail)).orElse(null);
        if (user == null || user.getStatus() == AccountStatus.SUSPENDED) {
            audit.info("event=RESET_CODE_SKIPPED reason={}", user == null ? "UNKNOWN_EMAIL" : "SUSPENDED");
            return response;
        }

        Instant now = clock.instant();
        PasswordResetCode latest = mongo.findOne(
                query(where("userId").is(user.getId())).with(Sort.by(Sort.Direction.DESC, "createdAt")).limit(1),
                PasswordResetCode.class);
        if (latest != null && latest.getCreatedAt().plus(resendCooldown).isAfter(now)) {
            audit.info("event=RESET_CODE_SKIPPED userId={} reason=COOLDOWN", user.getId());
            return response;
        }

        invalidateOpenCodes(user.getId(), now);

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));
        String salt = SecureTokens.newUrlSafeToken(16);
        PasswordResetCode record = new PasswordResetCode();
        record.setUserId(user.getId());
        record.setCodeSalt(salt);
        record.setCodeHash(hashCode(salt, code));
        record.setCodeExpiresAt(now.plus(codeTtl));
        record.setCreatedAt(now);
        record.setPurgeAt(now.plus(PURGE_AFTER));
        mongo.insert(record);

        codeSender.send(user, code, codeTtl);
        audit.info("event=RESET_CODE_SENT userId={}", user.getId());
        return response;
    }

    public VerifyResetCodeResponse verifyCode(String rawEmail, String code) {
        User user = users.findByEmail(AuthService.normalizeEmail(rawEmail)).orElse(null);
        if (user == null) {
            throw AuthException.invalidResetCode();
        }

        Instant now = clock.instant();
        PasswordResetCode record = mongo.findOne(
                query(where("userId").is(user.getId())
                        .and("invalidatedAt").is(null)
                        .and("verifiedAt").is(null)
                        .and("codeExpiresAt").gt(now)
                        .and("failedAttempts").lt(maxCodeAttempts))
                        .with(Sort.by(Sort.Direction.DESC, "createdAt")).limit(1),
                PasswordResetCode.class);
        if (record == null) {
            throw AuthException.invalidResetCode();
        }

        if (!codeMatches(record, code)) {
            mongo.updateFirst(query(where("_id").is(record.getId())),
                    new Update().inc("failedAttempts", 1), PasswordResetCode.class);
            audit.info("event=RESET_CODE_FAILED userId={}", user.getId());
            throw AuthException.invalidResetCode();
        }

        String resetToken = SecureTokens.newUrlSafeToken(32);
        PasswordResetCode claimed = mongo.findAndModify(
                query(where("_id").is(record.getId()).and("verifiedAt").is(null).and("invalidatedAt").is(null)),
                new Update().set("verifiedAt", now)
                        .set("resetTokenHash", SecureTokens.sha256Hex(resetToken))
                        .set("resetTokenExpiresAt", now.plus(resetTokenTtl)),
                FindAndModifyOptions.options().returnNew(true),
                PasswordResetCode.class);
        if (claimed == null) {
            throw AuthException.invalidResetCode();
        }

        audit.info("event=RESET_CODE_VERIFIED userId={}", user.getId());
        return new VerifyResetCodeResponse(resetToken, resetTokenTtl.toSeconds());
    }

    public PasswordResetResponse resetPassword(String resetToken, String newPassword) {
        Instant now = clock.instant();
        PasswordResetCode record = mongo.findOne(
                query(where("resetTokenHash").is(SecureTokens.sha256Hex(resetToken))
                        .and("usedAt").is(null)
                        .and("invalidatedAt").is(null)
                        .and("resetTokenExpiresAt").gt(now)),
                PasswordResetCode.class);
        if (record == null) {
            throw AuthException.resetSessionExpired();
        }

        User user = users.findById(record.getUserId()).orElseThrow(AuthException::resetSessionExpired);
        if (user.getStatus() == AccountStatus.SUSPENDED) {
            throw AuthException.accountSuspended();
        }
        // Checked before the token is consumed so the user can simply pick another password.
        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw AuthException.passwordReused();
        }

        PasswordResetCode claimed = mongo.findAndModify(
                query(where("_id").is(record.getId()).and("usedAt").is(null)),
                new Update().set("usedAt", now),
                PasswordResetCode.class);
        if (claimed == null) {
            throw AuthException.resetSessionExpired();
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setPasswordChangedAt(now);
        user.setTokenVersion(user.getTokenVersion() + 1);
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setUpdatedAt(now);
        users.save(user);

        refreshTokens.revokeAllForUser(user.getId(), RefreshToken.REASON_PASSWORD_RESET);
        invalidateOpenCodes(user.getId(), now);

        audit.info("event=PASSWORD_RESET userId={} action=ALL_SESSIONS_REVOKED", user.getId());
        return new PasswordResetResponse(now);
    }

    private void invalidateOpenCodes(String userId, Instant now) {
        mongo.updateMulti(
                query(where("userId").is(userId).and("invalidatedAt").is(null).and("usedAt").is(null)),
                new Update().set("invalidatedAt", now),
                PasswordResetCode.class);
    }

    private static boolean codeMatches(PasswordResetCode record, String code) {
        byte[] expected = record.getCodeHash().getBytes(StandardCharsets.UTF_8);
        byte[] actual = hashCode(record.getCodeSalt(), code).getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    static String hashCode(String salt, String code) {
        return SecureTokens.sha256Hex(salt + ":" + code);
    }
}
