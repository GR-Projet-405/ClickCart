package com.clickcart.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

import com.clickcart.model.User;

/**
 * Creates the unique email index on the users collection.
 * Spring Data does not auto-create @Indexed indexes by default, so it is done explicitly here.
 */
@Component
public class UserIndexInitializer {

    private static final Logger log = LoggerFactory.getLogger(UserIndexInitializer.class);

    private final MongoTemplate mongoTemplate;

    public UserIndexInitializer(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureIndexes() {
        try {
            mongoTemplate.indexOps(User.class)
                    .ensureIndex(new Index("email", Sort.Direction.ASC).unique().named("uk_users_email"));
        } catch (RuntimeException ex) {
            // Registration still guards duplicates in code; do not stop the application.
            log.warn("Could not ensure unique email index on users collection: {}", ex.getMessage());
        }
    }
}
