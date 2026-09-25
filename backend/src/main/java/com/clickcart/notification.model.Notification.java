package com.clickcart.notification.model;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * MongoDB document representing an in-app notification delivered to a user.
 *
 * <p>Ownership is expressed through {@code recipientId} (an opaque user
 * identifier string) and {@code recipientRole}. This document does NOT
 * hard-depend on an Auth/User implementation that does not exist yet in the
 * foundation; {@code recipientId} is treated as an opaque identifier.
 *
 * <p>Per SRS BR-09, users may only access their own private marketplace data,
 * so every read/mutation path that takes a user identity must verify that the
 * notification's {@code recipientId} matches the requesting user.
 */
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String recipientId;

    private RecipientRole recipientRole;

    private String eventType;

    private String title;

    private String message;

    private boolean read = false;

    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    @Field("metadata")
    private Map<String, Object> metadata;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public Notification() {
    }

    public Notification(String recipientId, RecipientRole recipientRole, String eventType,
                        String title, String message, Map<String, Object> metadata) {
        this.recipientId = recipientId;
        this.recipientRole = recipientRole;
        this.eventType = eventType;
        this.title = title;
        this.message = message;
        this.metadata = metadata;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(String recipientId) {
        this.recipientId = recipientId;
    }

    public RecipientRole getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(RecipientRole recipientRole) {
        this.recipientRole = recipientRole;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public Map<String, Object> getMetadata() {
        return metadata;
    }

    public void setMetadata(Map<String, Object> metadata) {
        this.metadata = metadata;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}