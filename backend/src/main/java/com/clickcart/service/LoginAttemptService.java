package com.clickcart.service;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

import java.time.Duration;
import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import com.clickcart.model.User;

/**
 * Counts failed password attempts per account and applies a temporary lockout (brute-force protection).
 * The counter uses an atomic $inc so parallel guesses cannot slip past the limit.
 */
@Service
public class LoginAttemptService {

    /** Result of a failed attempt: either attempts remaining, or the account is now locked until a time. */
    public record FailureOutcome(int attemptsRemaining, Instant lockedUntil) {
        public boolean locked() {
            return lockedUntil != null;
        }
    }

    private final MongoTemplate mongo;
    private final int maxAttempts;
    private final Duration lockDuration;

    public LoginAttemptService(
            MongoTemplate mongo,
            @Value("${AUTH_MAX_FAILED_LOGINS:5}") int maxAttempts,
            @Value("${AUTH_LOCKOUT_MINUTES:15}") long lockoutMinutes) {
        this.mongo = mongo;
        this.maxAttempts = maxAttempts;
        this.lockDuration = Duration.ofMinutes(lockoutMinutes);
    }

    public FailureOutcome recordFailure(String userId) {
        User updated = mongo.findAndModify(
                query(where("_id").is(userId)),
                new Update().inc("failedLoginAttempts", 1),
                FindAndModifyOptions.options().returnNew(true),
                User.class);
        int attempts = updated != null ? updated.getFailedLoginAttempts() : maxAttempts;

        if (attempts >= maxAttempts) {
            Instant lockedUntil = Instant.now().plus(lockDuration);
            mongo.updateFirst(
                    query(where("_id").is(userId)),
                    new Update().set("lockedUntil", lockedUntil).set("failedLoginAttempts", 0),
                    User.class);
            return new FailureOutcome(0, lockedUntil);
        }
        return new FailureOutcome(maxAttempts - attempts, null);
    }

    /** Clears the counter and any lock, e.g. after a successful login or a password reset. */
    public void clear(String userId) {
        mongo.updateFirst(
                query(where("_id").is(userId)),
                new Update().set("failedLoginAttempts", 0).unset("lockedUntil"),
                User.class);
    }
}
