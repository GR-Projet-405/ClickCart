package com.clickcart.notification.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.clickcart.notification.model.Notification;

/**
 * MongoDB repository for {@link Notification} documents.
 *
 * <p>The main list/unread-count query pattern is served by a compound index
 * on {@code (recipientId, read, createdAt)} defined in
 * {@code com.clickcart.notification.config.NotificationIndexConfig}.
 */
@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    /**
     * List a user's notifications newest-first, optionally filtered by read state.
     */
    Page<Notification> findByRecipientIdAndRead(
            String recipientId, boolean read, Pageable pageable);

    /**
     * List all of a user's notifications (no read filter), newest-first.
     */
    Page<Notification> findByRecipientId(String recipientId, Pageable pageable);

    /**
     * Count unread notifications for a user.
     */
    long countByRecipientIdAndReadFalse(String recipientId);

    /**
     * Fetch all unread notifications for a user (used by "mark all as read").
     */
    List<Notification> findByRecipientIdAndReadFalse(String recipientId);

    /**
     * Ownership-aware fetch. Returns the notification only if it belongs to the
     * given recipient; otherwise the result is null.
     */
    @Query("{ 'recipientId': ?0, 'id': ?1 }")
    Notification findByIdAndRecipientId(String id, String recipientId);
}