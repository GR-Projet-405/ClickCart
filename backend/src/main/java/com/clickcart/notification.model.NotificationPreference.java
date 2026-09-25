package com.clickcart.notification.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Per-user notification preferences. There is exactly one document per user.
 *
 * <p>The in-app channel is always on and cannot be disabled; the other channels
 * are optional and may be toggled on or off by the user. Individual event types
 * can additionally be disabled entirely for a user.
 */
@Document(collection = "notification_preferences")
public class NotificationPreference {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private boolean inAppEnabled = true;

    private boolean emailEnabled = true;

    private boolean smsEnabled = false;

    private boolean whatsappEnabled = false;

    private boolean pushEnabled = false;

    @Field("disabledEventTypes")
    private List<String> disabledEventTypes = new ArrayList<>();

    private LocalDateTime updatedAt;

    public NotificationPreference() {
    }

    public NotificationPreference(String userId) {
        this.userId = userId;
        this.updatedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public boolean isInAppEnabled() {
        return inAppEnabled;
    }

    public void setInAppEnabled(boolean inAppEnabled) {
        // in-app is always on; enforce the invariant at the boundary.
        this.inAppEnabled = true;
    }

    public boolean isEmailEnabled() {
        return emailEnabled;
    }

    public void setEmailEnabled(boolean emailEnabled) {
        this.emailEnabled = emailEnabled;
    }

    public boolean isSmsEnabled() {
        return smsEnabled;
    }

    public void setSmsEnabled(boolean smsEnabled) {
        this.smsEnabled = smsEnabled;
    }

    public boolean isWhatsappEnabled() {
        return whatsappEnabled;
    }

    public void setWhatsappEnabled(boolean whatsappEnabled) {
        this.whatsappEnabled = whatsappEnabled;
    }

    public boolean isPushEnabled() {
        return pushEnabled;
    }

    public void setPushEnabled(boolean pushEnabled) {
        this.pushEnabled = pushEnabled;
    }

    public List<String> getDisabledEventTypes() {
        return disabledEventTypes;
    }

    public void setDisabledEventTypes(List<String> disabledEventTypes) {
        this.disabledEventTypes = disabledEventTypes;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}