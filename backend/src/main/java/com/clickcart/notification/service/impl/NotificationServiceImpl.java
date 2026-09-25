package com.clickcart.notification.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import com.clickcart.notification.dto.NotificationEvent;
import com.clickcart.notification.dto.NotificationPreferenceResponse;
import com.clickcart.notification.dto.NotificationResponse;
import com.clickcart.notification.dto.UpdateNotificationPreferenceRequest;
import com.clickcart.notification.exception.NotificationAccessDeniedException;
import com.clickcart.notification.exception.NotificationNotFoundException;
import com.clickcart.notification.model.Notification;
import com.clickcart.notification.model.NotificationPreference;
import com.clickcart.notification.model.RecipientRole;
import com.clickcart.notification.repository.NotificationPreferenceRepository;
import com.clickcart.notification.repository.NotificationRepository;

/**
 * Default implementation of {@link NotificationService}.
 *
 * <p>Business rules:
 * <ul>
 *   <li>{@link #publish(NotificationEvent)} is defensive: invalid input and any
 *       internal failure are caught and logged. It never throws upward, so it
 *       is safe to call from other modules' business transactions (SRS
 *       SUP-009).</li>
 *   <li>Read/mutation paths verify ownership (SRS BR-09).</li>
 *   <li>The in-app channel is always on and cannot be disabled.</li>
 * </ul>
 */
@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;

    public NotificationServiceImpl(NotificationRepository notificationRepository,
                                   NotificationPreferenceRepository preferenceRepository) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
    }

    @Override
    public void publish(NotificationEvent event) {
        // SUP-009: this method MUST be safe to call from other services. Any
        // failure here is logged and swallowed — it never propagates.
        try {
            if (event == null) {
                log.warn("publish skipped: event is null");
                return;
            }
            if (!StringUtils.hasText(event.recipientId())) {
                log.warn("publish skipped: recipientId is blank");
                return;
            }
            if (!StringUtils.hasText(event.eventType())) {
                log.warn("publish skipped: eventType is blank");
                return;
            }
            if (!StringUtils.hasText(event.title()) || !StringUtils.hasText(event.message())) {
                log.warn("publish skipped: title/message is blank");
                return;
            }

            RecipientRole role = parseRole(event.recipientRole());

            Notification notification = new Notification(
                    event.recipientId().trim(),
                    role,
                    event.eventType().trim(),
                    event.title().trim(),
                    event.message().trim(),
                    event.metadata()
            );

            notificationRepository.save(notification);
            log.debug("Published notification eventType={} for recipient={}",
                    event.eventType(), event.recipientId());
        } catch (Exception ex) {
            // Never let a notification failure break the caller's transaction.
            log.error("Failed to publish notification for eventType={} recipientId={}: {}",
                    event == null ? null : event.eventType(),
                    event == null ? null : event.recipientId(),
                    ex.getMessage(), ex);
        }
    }

    @Override
    public Page<NotificationResponse> listForUser(String recipientId, Boolean read, Pageable pageable) {
        Assert.hasText(recipientId, "recipientId must not be blank");
        Assert.notNull(pageable, "pageable must not be null");

        Page<Notification> page = (read == null)
                ? notificationRepository.findByRecipientId(recipientId, pageable)
                : notificationRepository.findByRecipientIdAndRead(recipientId, read, pageable);

        return page.map(this::toResponse);
    }

    @Override
    public long getUnreadCount(String recipientId) {
        Assert.hasText(recipientId, "recipientId must not be blank");
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    @Override
    @Transactional
    public void markAsRead(String notificationId, String recipientId) {
        Assert.hasText(notificationId, "notificationId must not be blank");
        Assert.hasText(recipientId, "recipientId must not be blank");

        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, recipientId);
        if (notification == null) {
            // Distinguish not-found from wrong-owner so the caller can map 404 vs 403.
            boolean exists = notificationRepository.existsById(notificationId);
            if (exists) {
                throw new NotificationAccessDeniedException(
                        "Notification " + notificationId + " does not belong to user " + recipientId);
            }
            throw new NotificationNotFoundException("Notification not found: " + notificationId);
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }

    @Override
    @Transactional
    public int markAllAsRead(String recipientId) {
        Assert.hasText(recipientId, "recipientId must not be blank");
        var unread = notificationRepository.findByRecipientIdAndReadFalse(recipientId);
        if (CollectionUtils.isEmpty(unread)) {
            return 0;
        }
        LocalDateTime now = LocalDateTime.now();
        for (Notification n : unread) {
            n.setRead(true);
            n.setReadAt(now);
        }
        notificationRepository.saveAll(unread);
        return unread.size();
    }

    @Override
    @Transactional
    public void delete(String notificationId, String recipientId) {
        Assert.hasText(notificationId, "notificationId must not be blank");
        Assert.hasText(recipientId, "recipientId must not be blank");

        Notification notification = notificationRepository.findByIdAndRecipientId(notificationId, recipientId);
        if (notification == null) {
            boolean exists = notificationRepository.existsById(notificationId);
            if (exists) {
                throw new NotificationAccessDeniedException(
                        "Notification " + notificationId + " does not belong to user " + recipientId);
            }
            throw new NotificationNotFoundException("Notification not found: " + notificationId);
        }
        notificationRepository.delete(notification);
    }

    @Override
    public NotificationPreferenceResponse getPreferences(String userId) {
        Assert.hasText(userId, "userId must not be blank");
        NotificationPreference prefs = preferenceRepository.findById(userId)
                .orElseGet(() -> preferenceRepository.save(new NotificationPreference(userId)));
        return toPreferenceResponse(prefs);
    }

    @Override
    @Transactional
    public NotificationPreferenceResponse updatePreferences(String userId, UpdateNotificationPreferenceRequest request) {
        Assert.hasText(userId, "userId must not be blank");
        Assert.notNull(request, "request must not be null");

        NotificationPreference prefs = preferenceRepository.findById(userId)
                .orElseGet(() -> new NotificationPreference(userId));

        if (request.emailEnabled() != null) prefs.setEmailEnabled(request.emailEnabled());
        if (request.smsEnabled() != null) prefs.setSmsEnabled(request.smsEnabled());
        if (request.whatsappEnabled() != null) prefs.setWhatsappEnabled(request.whatsappEnabled());
        if (request.pushEnabled() != null) prefs.setPushEnabled(request.pushEnabled());
        if (request.disabledEventTypes() != null) {
            prefs.setDisabledEventTypes(request.disabledEventTypes().stream().filter(StringUtils::hasText).toList());
        }
        // in-app is always on — enforce regardless of client input.
        prefs.setInAppEnabled(true);
        prefs.setUpdatedAt(LocalDateTime.now());

        return toPreferenceResponse(preferenceRepository.save(prefs));
    }

    private RecipientRole parseRole(String role) {
        if (!StringUtils.hasText(role)) {
            return RecipientRole.CUSTOMER;
        }
        try {
            return RecipientRole.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            log.warn("Unknown recipientRole '{}' — defaulting to CUSTOMER", role);
            return RecipientRole.CUSTOMER;
        }
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getRecipientId(),
                n.getRecipientRole() == null ? null : n.getRecipientRole().name(),
                n.getEventType(),
                n.getTitle(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt(),
                n.getReadAt(),
                n.getMetadata()
        );
    }

    private NotificationPreferenceResponse toPreferenceResponse(NotificationPreference p) {
        return new NotificationPreferenceResponse(
                p.getUserId(),
                p.isInAppEnabled(),
                p.isEmailEnabled(),
                p.isSmsEnabled(),
                p.isWhatsappEnabled(),
                p.isPushEnabled(),
                p.getDisabledEventTypes()
        );
    }
}