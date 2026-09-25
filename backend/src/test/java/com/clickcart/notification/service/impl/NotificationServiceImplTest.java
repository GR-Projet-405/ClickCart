package com.clickcart.notification.service;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.clickcart.notification.dto.NotificationEvent;
import com.clickcart.notification.dto.NotificationPreferenceResponse;
import com.clickcart.notification.dto.UpdateNotificationPreferenceRequest;
import com.clickcart.notification.exception.NotificationAccessDeniedException;
import com.clickcart.notification.exception.NotificationNotFoundException;
import com.clickcart.notification.model.Notification;
import com.clickcart.notification.model.NotificationPreference;
import com.clickcart.notification.model.RecipientRole;
import com.clickcart.notification.repository.NotificationPreferenceRepository;
import com.clickcart.notification.repository.NotificationRepository;

/**
 * Unit tests for {@link NotificationServiceImpl} using mocked repositories.
 *
 * <p>Covers the three critical contract guarantees:
 * <ol>
 *   <li>{@link NotificationServiceImpl#publish(NotificationEvent)} never throws —
 *       invalid input and repository failures are logged and swallowed (SRS
 *       SUP-009).</li>
 *   <li>{@link NotificationServiceImpl#markAsRead(String, String)} enforces
 *       ownership (SRS BR-09).</li>
 *   <li>Unread-count correctness.</li>
 * </ol>
 */
class NotificationServiceImplTest {

    private final NotificationRepository repo = Mockito.mock(NotificationRepository.class);
    private final NotificationPreferenceRepository prefRepo = Mockito.mock(NotificationPreferenceRepository.class);
    private final NotificationService service = new NotificationServiceImpl(repo, prefRepo);

    // --- publish never throws ---

    @Test
    void publish_nullEvent_isIgnored() {
        service.publish(null);
        verify(repo, never()).save(any());
    }

    @Test
    void publish_blankFields_areIgnored() {
        service.publish(new NotificationEvent("", null, "", "", "", null));
        service.publish(new NotificationEvent("user-1", null, null, null, null, null));
        verify(repo, never()).save(any());
    }

    @Test
    void publish_repositoryFailure_isSwallowed() {
        doThrow(new RuntimeException("db down"))
                .when(repo).save(any(Notification.class));

        // Must not throw — this is the SUP-009 guarantee.
        service.publish(new NotificationEvent(
                "user-1", "CUSTOMER", "booking.status_changed",
                "Booking updated", "Your booking changed status",
                Map.of("bookingId", "BK-1")));

        verify(repo, times(1)).save(any(Notification.class));
    }

    @Test
    void publish_validEvent_createsNotification() {
        service.publish(new NotificationEvent(
                "user-1", "CUSTOMER", "booking.status_changed",
                "Booking updated", "Your booking changed status",
                Map.of("bookingId", "BK-1")));

        verify(repo, times(1)).save(Mockito.argThat(n ->
                "user-1".equals(n.getRecipientId())
                && n.getRecipientRole() == RecipientRole.CUSTOMER
                && "booking.status_changed".equals(n.getEventType())
                && !n.isRead()
                && n.getCreatedAt() != null));
    }

    // --- ownership check on markAsRead ---

    @Test
    void markAsRead_notFound_throwsNotFound() {
        when(repo.findByIdAndRecipientId("n-1", "user-1")).thenReturn(null);
        when(repo.existsById("n-1")).thenReturn(false);

        assertThatThrownBy(() -> service.markAsRead("n-1", "user-1"))
                .isInstanceOf(NotificationNotFoundException.class);
    }

    @Test
    void markAsRead_wrongOwner_throwsAccessDenied() {
        when(repo.findByIdAndRecipientId("n-1", "user-1")).thenReturn(null);
        when(repo.existsById("n-1")).thenReturn(true);

        assertThatThrownBy(() -> service.markAsRead("n-1", "user-1"))
                .isInstanceOf(NotificationAccessDeniedException.class);
    }

    @Test
    void markAsRead_owner_marksRead() {
        Notification n = new Notification();
        n.setId("n-1");
        n.setRecipientId("user-1");
        n.setRead(false);

        when(repo.findByIdAndRecipientId("n-1", "user-1")).thenReturn(n);

        service.markAsRead("n-1", "user-1");

        assertThat(n.isRead()).isTrue();
        verify(repo).save(n);
    }

    @Test
    void markAsRead_alreadyRead_isIdempotent() {
        Notification n = new Notification();
        n.setId("n-1");
        n.setRecipientId("user-1");
        n.setRead(true);

        when(repo.findByIdAndRecipientId("n-1", "user-1")).thenReturn(n);

        service.markAsRead("n-1", "user-1");

        verify(repo, never()).save(any());
    }

    // --- unread count ---

    @Test
    void unreadCount_correct() {
        when(repo.countByRecipientIdAndReadFalse("user-1")).thenReturn(7L);
        assertThat(service.getUnreadCount("user-1")).isEqualTo(7L);
    }

    // --- markAllAsRead ---

    @Test
    void markAllAsRead_marksAllUnread() {
        Notification a = new Notification();
        a.setRecipientId("user-1");
        a.setRead(false);
        Notification b = new Notification();
        b.setRecipientId("user-1");
        b.setRead(false);
        when(repo.findByRecipientIdAndReadFalse("user-1")).thenReturn(List.of(a, b));

        int count = service.markAllAsRead("user-1");

        assertThat(count).isEqualTo(2);
        assertThat(a.isRead()).isTrue();
        assertThat(b.isRead()).isTrue();
        verify(repo).saveAll(List.of(a, b));
    }

    @Test
    void markAllAsRead_empty_returnsZero() {
        when(repo.findByRecipientIdAndReadFalse("user-1")).thenReturn(List.of());
        assertThat(service.markAllAsRead("user-1")).isZero();
        verify(repo, never()).saveAll(any());
    }

    // --- preferences ---

    @Test
    void getPreferences_createsDefaults_whenMissing() {
        when(prefRepo.findById("user-1")).thenReturn(java.util.Optional.empty());

        NotificationPreferenceResponse resp = service.getPreferences("user-1");

        assertThat(resp.userId()).isEqualTo("user-1");
        assertThat(resp.inAppEnabled()).isTrue();
        assertThat(resp.emailEnabled()).isTrue();
        verify(prefRepo).save(Mockito.argThat(p -> p getUserId().equals("user-1")));
    }

    @Test
    void updatePreferences_enforcesInAppAlwaysOn() {
        NotificationPreference existing = new NotificationPreference("user-1");
        when(prefRepo.findById("user-1")).thenReturn(java.util.Optional.of(existing));

        service.updatePreferences("user-1",
                new UpdateNotificationPreferenceRequest(false, false, null, null, null, List.of("booking.created")));

        // in-app must remain on regardless of client input.
        assertThat(existing.isInAppEnabled()).isTrue();
        assertThat(existing.isEmailEnabled()).isFalse();
        assertThat(existing.getDisabledEventTypes()).containsExactly("booking.created");
    }
}