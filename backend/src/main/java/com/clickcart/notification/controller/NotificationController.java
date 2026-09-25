package com.clickcart.notification.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotationPathVariable;

import com.clickcart.notification.dto.NotificationPreferenceResponse;
import com.clickcart.notification.dto.NotificationResponse;
import com.clickcart.notification.dto.UpdateNotificationPreferenceRequest;
import com.clickcart.notification.service.NotificationService;
import com.clickcart.notification.util.NotificationCurrentUserResolver;

import jakarta.servlet.http.HttpServletRequest;

/**
 * REST controller for the notification center.
 *
 * <p>Base path: {@code /api/notifications}.
 *
 * <p>PAGINATION NOTE: pagination uses simple {@code page} / {@code size}
 * query parameters because the project-wide pagination convention is still
 * TBD per docs/api-conventions.md. Reconcile with the team's final
 * pagination convention (page size, sort fields, envelope shape) once agreed.
 *
 * <p>AUTH NOTE: the current user id is read from the {@code X-User-Id} header
 * via {@link NotificationCurrentUserResolver}. This is a TEMPORARY seam —
 * replace with real Spring Security auth once DEV-01 is merged.
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@Validated
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationCurrentUserResolver currentUserResolver;

    public NotificationController(NotificationService notificationService,
                                  NotificationCurrentUserResolver currentUserResolver) {
        this.notificationService = notificationService;
        this.currentUserResolver = currentUserResolver;
    }

    /**
     * List the current user's notifications.
     *
     * @param read optional filter: {@code true} for read-only, {@code false} for
     *             unread-only, omitted for all.
     * @param page zero-based page number (default 0).
     * @param size page size (default 20).
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> list(
            HttpServletRequest request,
            @RequestParam(required = false) Boolean read,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        String userId = currentUserResolver.currentUserId(request);
        Page<NotificationResponse> result = notificationService.listForUser(
                userId, read, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(result);
    }

    /**
     * Unread count for the current user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(HttpServletRequest request) {
        String userId = currentUserResolver.currentUserId(request);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    /**
     * Mark a single notification as read (owned by the current user only).
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(HttpServletRequest request,
                                            @PathVariable("id") String id) {
        String userId = currentUserResolver.currentUserId(request);
        notificationService.markAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Mark all of the current user's notifications as read.
     */
    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(HttpServletRequest request) {
        String userId = currentUserResolver.currentUserId(request);
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("markedRead", count));
    }

    /**
     * Delete a single notification owned by the current user.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(HttpServletRequest request,
                                       @PathVariable("id") String id) {
        String userId = currentUserResolver.currentUserId(request);
        notificationService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get the current user's notification preferences (creates defaults).
     */
    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> getPreferences(HttpServletRequest request) {
        String userId = currentUserResolver.currentUserId(request);
        return ResponseEntity.ok(notificationService.getPreferences(userId));
    }

    /**
     * Update the current user's notification preferences.
     */
    @PutMapping("/preferences")
    public ResponseEntity<NotificationPreferenceResponse> updatePreferences(
            HttpServletRequest request,
            @Validated @RequestBody UpdateNotificationPreferenceRequest req) {
        String userId = currentUserResolver.currentUserId(request);
        return ResponseEntity.ok(notificationService.updatePreferences(userId, req));
    }
}