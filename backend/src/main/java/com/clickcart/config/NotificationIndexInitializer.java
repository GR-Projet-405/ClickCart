package com.clickcart.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.stereotype.Component;

import com.clickcart.model.Notification;
import com.clickcart.model.NotificationPreference;

/**
 * Creates the indexes the notification feature relies on.
 * Spring Data does not auto-create indexes by default, so they are declared explicitly here.
 */
@Component
public class NotificationIndexInitializer {

    private static final Logger log = LoggerFactory.getLogger(NotificationIndexInitializer.class);

    private final MongoTemplate mongoTemplate;

    public NotificationIndexInitializer(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void ensureIndexes() {
        try {
            var notifications = mongoTemplate.indexOps(Notification.class);
            notifications.ensureIndex(new Index()
                    .on("recipientUserId", Sort.Direction.ASC)
                    .on("createdAt", Sort.Direction.DESC)
                    .named("idx_notifications_recipient_created"));
            notifications.ensureIndex(new Index()
                    .on("recipientUserId", Sort.Direction.ASC)
                    .on("read", Sort.Direction.ASC)
                    .named("idx_notifications_recipient_read"));

            mongoTemplate.indexOps(NotificationPreference.class)
                    .ensureIndex(new Index("userId", Sort.Direction.ASC)
                            .unique()
                            .named("uk_notification_preferences_user"));
        } catch (RuntimeException ex) {
            log.warn("Could not ensure notification indexes: {}", ex.getMessage());
        }
    }
}
