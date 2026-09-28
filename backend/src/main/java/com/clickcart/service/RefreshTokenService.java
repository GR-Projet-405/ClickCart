package com.clickcart.service;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.clickcart.exception.AuthException;
import com.clickcart.model.AccountStatus;
import com.clickcart.model.RefreshToken;
import com.clickcart.model.User;
import com.clickcart.repository.UserRepository;
import com.clickcart.util.SecureTokens;

/**
 * Issues, rotates and revokes refresh tokens (SRS IAM-009).
 *
 * Every refresh revokes the presented token and issues a new one with the same absolute expiry.
 * Presenting an already-rotated token after the grace window is treated as token theft and revokes
 * all of the user's sessions. The grace window tolerates two tabs refreshing at the same moment.
 */
@Service
public class RefreshTokenService {

    private static final Logger audit = LoggerFactory.getLogger("clickcart.audit.auth");
    private static final Duration REUSE_GRACE = Duration.ofSeconds(30);

    public record IssuedRefreshToken(String rawToken, Instant expiresAt, boolean rememberMe) {
    }

    public record Rotation(User user, IssuedRefreshToken refreshToken) {
    }

    private final MongoTemplate mongo;
    private final UserRepository users;
    private final Duration sessionTtl;
    private final Duration rememberMeTtl;
    private final Clock clock;

    @Autowired
    public RefreshTokenService(
            MongoTemplate mongo,
            UserRepository users,
            @Value("${AUTH_SESSION_TTL_HOURS:24}") long sessionTtlHours,
            @Value("${AUTH_REMEMBER_ME_TTL_DAYS:30}") long rememberMeTtlDays) {
        this(mongo, users, Duration.ofHours(sessionTtlHours), Duration.ofDays(rememberMeTtlDays), Clock.systemUTC());
    }

    RefreshTokenService(MongoTemplate mongo, UserRepository users,
                        Duration sessionTtl, Duration rememberMeTtl, Clock clock) {
        this.mongo = mongo;
        this.users = users;
        this.sessionTtl = sessionTtl;
        this.rememberMeTtl = rememberMeTtl;
        this.clock = clock;
    }

    public IssuedRefreshToken issue(String userId, boolean rememberMe) {
        Instant expiresAt = clock.instant().plus(rememberMe ? rememberMeTtl : sessionTtl);
        return issue(userId, rememberMe, expiresAt);
    }

    public Rotation rotate(String rawToken) {
        if (!StringUtils.hasText(rawToken)) {
            throw AuthException.sessionExpired();
        }
        String hash = SecureTokens.sha256Hex(rawToken);
        Instant now = clock.instant();

        // Atomically claim the token so two concurrent refreshes cannot both succeed.
        RefreshToken current = mongo.findAndModify(
                query(where("tokenHash").is(hash).and("revokedAt").is(null)),
                new Update().set("revokedAt", now).set("revokedReason", RefreshToken.REASON_ROTATED),
                FindAndModifyOptions.options().returnNew(false),
                RefreshToken.class);

        if (current == null) {
            handleUnusableToken(hash, now);
            throw AuthException.sessionExpired();
        }
        if (!current.getExpiresAt().isAfter(now)) {
            throw AuthException.sessionExpired();
        }

        User user = users.findById(current.getUserId()).orElse(null);
        if (user == null || user.getStatus() == AccountStatus.SUSPENDED) {
            revokeAllForUser(current.getUserId(), RefreshToken.REASON_ACCOUNT_UNAVAILABLE);
            throw user == null ? AuthException.sessionExpired() : AuthException.accountSuspended();
        }

        IssuedRefreshToken next = issue(user.getId(), current.isRememberMe(), current.getExpiresAt());
        return new Rotation(user, next);
    }

    public void revoke(String rawToken) {
        if (!StringUtils.hasText(rawToken)) {
            return;
        }
        mongo.updateFirst(
                query(where("tokenHash").is(SecureTokens.sha256Hex(rawToken)).and("revokedAt").is(null)),
                new Update().set("revokedAt", clock.instant()).set("revokedReason", RefreshToken.REASON_LOGOUT),
                RefreshToken.class);
    }

    public void revokeAllForUser(String userId, String reason) {
        mongo.updateMulti(
                query(where("userId").is(userId).and("revokedAt").is(null)),
                new Update().set("revokedAt", clock.instant()).set("revokedReason", reason),
                RefreshToken.class);
    }

    private void handleUnusableToken(String hash, Instant now) {
        RefreshToken existing = mongo.findOne(query(where("tokenHash").is(hash)), RefreshToken.class);
        boolean rotatedLongAgo = existing != null
                && RefreshToken.REASON_ROTATED.equals(existing.getRevokedReason())
                && existing.getRevokedAt() != null
                && existing.getRevokedAt().plus(REUSE_GRACE).isBefore(now);
        if (rotatedLongAgo) {
            revokeAllForUser(existing.getUserId(), RefreshToken.REASON_REUSE_DETECTED);
            audit.warn("event=REFRESH_TOKEN_REUSE userId={} action=ALL_SESSIONS_REVOKED", existing.getUserId());
        }
    }

    private IssuedRefreshToken issue(String userId, boolean rememberMe, Instant expiresAt) {
        String raw = SecureTokens.newUrlSafeToken(32);
        RefreshToken token = new RefreshToken();
        token.setUserId(userId);
        token.setTokenHash(SecureTokens.sha256Hex(raw));
        token.setRememberMe(rememberMe);
        token.setExpiresAt(expiresAt);
        token.setCreatedAt(clock.instant());
        mongo.insert(token);
        return new IssuedRefreshToken(raw, expiresAt, rememberMe);
    }
}
