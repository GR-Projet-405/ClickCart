package com.clickcart.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.clickcart.dto.NotificationPreferenceGroupResponse;
import com.clickcart.dto.NotificationPreferenceItemResponse;
import com.clickcart.dto.NotificationPreferencesResponse;
import com.clickcart.dto.NotificationResponse;
import com.clickcart.dto.UnreadCountResponse;
import com.clickcart.exception.BadRequestException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Notification;
import com.clickcart.model.NotificationPreference;
import com.clickcart.model.NotificationType;
import com.clickcart.model.Role;
import com.clickcart.repository.NotificationPreferenceRepository;
import com.clickcart.repository.NotificationRepository;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    public NotificationService(NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
    }

    /**
     * Stores a notification for one user. Returns empty when the type is turned off,
     * or when that role is not allowed to receive it.
     */
    public Optional<Notification> publish(String recipientUserId, Role role, NotificationType type,
            String title, String body, String sourceType, String sourceId) {
        if (recipientUserId == null || recipientUserId.isBlank() || role == null || type == null) {
            return Optional.empty();
        }
        if (!NotificationCatalog.allows(role, type)) {
            log.debug("Skipped notification {} because role {} cannot receive it", type, role);
            return Optional.empty();
        }
        boolean enabled = preferenceRepository.findByUserId(recipientUserId)
                .map(NotificationPreference::getEnabled)
                .map(enabledMap -> enabledMap.getOrDefault(type.name(), true))
                .orElse(true);
        if (!enabled) {
            return Optional.empty();
        }

        Notification notification = new Notification();
        notification.setRecipientUserId(recipientUserId);
        notification.setRecipientRole(role);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        notification.setRead(false);
        notification.setSourceType(sourceType);
        notification.setSourceId(sourceId);
        notification.setCreatedAt(Instant.now());
        return Optional.of(notificationRepository.save(notification));
    }

    public List<NotificationResponse> listForUser(String userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public UnreadCountResponse unreadCount(String userId) {
        return new UnreadCountResponse(notificationRepository.countByRecipientUserIdAndReadFalse(userId));
    }

    public NotificationResponse markRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findByIdAndRecipientUserId(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(Instant.now());
            notification = notificationRepository.save(notification);
        }
        return toResponse(notification);
    }

    public NotificationPreferencesResponse preferencesFor(String userId, Role role) {
        Map<String, Boolean> saved = preferenceRepository.findByUserId(userId)
                .map(NotificationPreference::getEnabled)
                .orElseGet(Map::of);
        NotificationPreferencesResponse response = new NotificationPreferencesResponse();
        List<NotificationPreferenceGroupResponse> groups = new ArrayList<>();
        for (NotificationCatalog.Group group : NotificationCatalog.groupsFor(role)) {
            NotificationPreferenceGroupResponse groupResponse = new NotificationPreferenceGroupResponse();
            groupResponse.setKey(group.key());
            groupResponse.setLabel(group.label());
            List<NotificationPreferenceItemResponse> items = new ArrayList<>();
            for (NotificationCatalog.Item item : group.items()) {
                NotificationPreferenceItemResponse itemResponse = new NotificationPreferenceItemResponse();
                itemResponse.setType(item.type());
                itemResponse.setTitle(item.title());
                itemResponse.setDescription(item.description());
                itemResponse.setEnabled(saved.getOrDefault(item.type().name(), true));
                items.add(itemResponse);
            }
            groupResponse.setItems(items);
            groups.add(groupResponse);
        }
        response.setGroups(groups);
        return response;
    }

    public NotificationPreferencesResponse savePreferences(String userId, Role role, Map<String, Boolean> enabled) {
        Map<String, Boolean> stored = new LinkedHashMap<>();
        for (Map.Entry<String, Boolean> entry : enabled.entrySet()) {
            NotificationType type = parseType(entry.getKey());
            if (!NotificationCatalog.allows(role, type)) {
                throw new BadRequestException("Notification type is not available for this account");
            }
            if (entry.getValue() == null) {
                throw new BadRequestException("Each preference must be true or false");
            }
            stored.put(type.name(), entry.getValue());
        }
        for (NotificationCatalog.Group group : NotificationCatalog.groupsFor(role)) {
            for (NotificationCatalog.Item item : group.items()) {
                stored.putIfAbsent(item.type().name(), true);
            }
        }

        NotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(NotificationPreference::new);
        preference.setUserId(userId);
        preference.setEnabled(stored);
        preference.setUpdatedAt(Instant.now());
        preferenceRepository.save(preference);
        return preferencesFor(userId, role);
    }

    private NotificationType parseType(String value) {
        try {
            return NotificationType.valueOf(value);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BadRequestException("Unknown notification type");
        }
    }

    private NotificationResponse toResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType());
        response.setTitle(notification.getTitle());
        response.setBody(notification.getBody());
        response.setRead(notification.isRead());
        response.setReadAt(notification.getReadAt());
        response.setCreatedAt(notification.getCreatedAt());
        response.setSourceType(notification.getSourceType());
        response.setSourceId(notification.getSourceId());
        return response;
    }
}
