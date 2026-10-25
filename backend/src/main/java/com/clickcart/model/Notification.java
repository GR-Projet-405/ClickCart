package com.clickcart.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "notifications")
@CompoundIndexes({
        @CompoundIndex(name = "idx_notifications_recipient_created", def = "{ 'recipientUserId': 1, 'createdAt': -1 }"),
        @CompoundIndex(name = "idx_notifications_recipient_read", def = "{ 'recipientUserId': 1, 'read': 1 }")
})
public class Notification {

    @Id
    private String id;

    @Field("recipientUserId")
    private String recipientUserId;

    @Field("recipientRole")
    private Role recipientRole;

    @Field("type")
    private NotificationType type;

    @Field("title")
    private String title;

    @Field("body")
    private String body;

    @Field("read")
    private boolean read;

    @Field("readAt")
    private Instant readAt;

    @CreatedDate
    @Field("createdAt")
    private Instant createdAt;

    @Field("sourceType")
    private String sourceType;

    @Field("sourceId")
    private String sourceId;

    public Notification() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRecipientUserId() {
        return recipientUserId;
    }

    public void setRecipientUserId(String recipientUserId) {
        this.recipientUserId = recipientUserId;
    }

    public Role getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(Role recipientRole) {
        this.recipientRole = recipientRole;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public Instant getReadAt() {
        return readAt;
    }

    public void setReadAt(Instant readAt) {
        this.readAt = readAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getSourceType() {
        return sourceType;
    }

    public void setSourceType(String sourceType) {
        this.sourceType = sourceType;
    }

    public String getSourceId() {
        return sourceId;
    }

    public void setSourceId(String sourceId) {
        this.sourceId = sourceId;
    }
}
