package com.clickcart.repository;

import com.clickcart.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);

    long countByRecipientUserIdAndReadFalse(String recipientUserId);

    Optional<Notification> findByIdAndRecipientUserId(String id, String recipientUserId);
}
