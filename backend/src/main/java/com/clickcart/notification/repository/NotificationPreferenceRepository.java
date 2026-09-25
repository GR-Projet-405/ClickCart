package com.clickcart.notification.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clickcart.notification.model.NotificationPreference;

/**
 * MongoDB repository for {@link NotificationPreference} documents.
 * There is exactly one preference document per user (unique index on userId).
 */
@Repository
public interface NotificationPreferenceRepository extends MongoRepository<NotificationPreference, String> {

    Optional<NotificationPreference> findByUserId(String userId);
}