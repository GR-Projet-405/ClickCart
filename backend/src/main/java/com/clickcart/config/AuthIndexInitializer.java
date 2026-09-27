package com.clickcart.config;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

import com.clickcart.model.RefreshToken;
import com.clickcart.model.User;

/**
 * Creates the indexes the auth feature relies on.
 * Spring Data does not auto-create @Indexed indexes by default, so they are declared explicitly here.
 */
@Component
public class AuthIndexInitializer {

    private static final Logger log = LoggerFactory.getLogger(AuthIndexInitializer.class);

    private final MongoTemplate mongoTemplate;

    public AuthIndexInitializer(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureIndexes() {
        try {
            mongoTemplate.indexOps(User.class)
                    .ensureIndex(new Index("email", Sort.Direction.ASC).unique().named("uk_users_email"));

            var refreshTokens = mongoTemplate.indexOps(RefreshToken.class);
            refreshTokens.ensureIndex(new Index("tokenHash", Sort.Direction.ASC).unique().named("uk_refresh_tokens_hash"));
            refreshTokens.ensureIndex(new Index("userId", Sort.Direction.ASC).named("ix_refresh_tokens_user"));
            // MongoDB deletes each token document automatically once expiresAt has passed.
            refreshTokens.ensureIndex(new Index("expiresAt", Sort.Direction.ASC)
                    .expire(Duration.ZERO).named("ttl_refresh_tokens_expires"));
        } catch (RuntimeException ex) {
            // The code still guards duplicates and expiry; do not stop the application.
            log.warn("Could not ensure auth indexes: {}", ex.getMessage());
        }
    }
}
