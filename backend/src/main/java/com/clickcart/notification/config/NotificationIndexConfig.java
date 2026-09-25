package com.clickcart.notification.config;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.springframework.stereotype.Component;

import com.clickcart.notification.model.Notification;
import com.clickcart.notification.model.NotificationPreference;

/**
 * Declares MongoDB indexes for the notification module.
 *
 * <p>Indexes are added intentionally for demonstrated query patterns only
 * (per docs/mongodb-guidelines.md), not speculatively.
 */
@Component
public class NotificationIndexConfig {

    public NotificationIndexConfig(MongoTemplate mongoTemplate) {
        ensureNotificationIndexes(mongoTemplate.indexOps(Notification.class));
        ensurePreferenceIndexes(mongoTemplate.indexOps(NotificationPreference.class));
    }

    private void ensureNotificationIndexes(IndexOperations ops) {
        // Main list / unread-count query pattern:
        //   findByRecipientIdAndRead(..., Pageable) and countByRecipientIdAndReadFalse
        // served by (recipientId, read, createdAt) — read is selective, createdAt
        // gives newest-first ordering without a separate sort stage.
        if (!hasIndex(ops, "recipientId_read_createdAt")) {
            ops.ensureIndex(
                    new Index()
                            .on("recipientId", Sort.Direction.ASC)
                            .on("read", Sort.Direction.ASC)
                            .on("createdAt", Sort.Direction.DESC)
                            .named("recipientId_read_createdAt"));
        }
    }

    private void ensurePreferenceIndexes(IndexOperations ops) {
        // Preferences lookup by userId is served by a unique index on userId.
        if (!hasIndex(ops, "userId_unique")) {
            ops.ensureIndex(new Index().on("userId", Sort.Direction.ASC).unique().named("userId_unique"));
        }
    }

    private boolean hasIndex(IndexOperations ops, String name) {
        return ops.getIndexInfo().stream()
                .anyMatch(idx -> name.equals(idx.getName()));
    }
}