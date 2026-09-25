package com.clickcart.notification;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.mockito.Mockito;

import com.clickcart.notification.dto.NotificationResponse;
import com.clickcart.notification.repository.NotificationPreferenceRepository;
import com.clickcart.notification.repository.NotificationRepository;
import com.clickcart.notification.service.NotificationService;
import com.clickcart.notification.service.impl.NotificationServiceImpl;

/**
 * Integration test for the notification REST endpoints and the X-User-Id auth
 * seam (DEV-33 temporary). Uses MockMvc with mocked repositories so it runs
 * without a live MongoDB instance.
 */
@org.springframework.boot.test.context.SpringBootTest
@AutoConfigureMockMvc
class NotificationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public NotificationRepository notificationRepository() {
            return Mockito.mock(NotificationRepository.class);
        }

        @Bean
        public NotificationPreferenceRepository preferenceRepository() {
            return Mockito.mock(NotificationPreferenceRepository.class);
        }

        @Bean
        public NotificationService notificationService(
                NotificationRepository notificationRepository,
                NotificationPreferenceRepository preferenceRepository) {
            return new NotificationServiceImpl(notificationRepository, preferenceRepository);
        }
    }

    @Autowired
    private NotificationRepository repo;

    @Autowired
    private NotificationPreferenceRepository prefRepo;

    @Test
    void list_unreadCount_markAllRead_preferences_flow() throws Exception {
        String user = "user-int-1";

        when(repo.countByRecipientIdAndReadFalse(user)).thenReturn(2L);

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("X-User-Id", user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount").value(2));

        NotificationResponse n1 = new NotificationResponse(
                "n-1", user, "CUSTOMER", "booking.status_changed",
                "Booking updated", "Your booking changed status",
                false, null, null, Map.of("bookingId", "BK-1"));
        when(repo.findByRecipientIdAndRead(user, false,
                PageRequest.of(0, 10, Sort.by("createdAt").descending())))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of(n1)));

        mockMvc.perform(get("/api/notifications")
                        .param("read", "false")
                        .header("X-User-Id", user))
                .andExpect(status().isOk())
                .AND(jsonPath("$.content[0].id").value("n-1"))
                .AND(jsonPath("$.content[0].eventType").value("booking.status_changed"))
                .AND(jsonPath("$.content[0].read").value(false));

        when(repo.findByRecipientIdAndReadFalse(user)).thenReturn(List.of());
        mockMvc.perform(post("/api/notifications/read-all")
                        .header("X-User-Id", user))
                .andExpect(status().isOk())
                .AND(jsonPath("$.markedRead").value(0));

        when(prefRepo.findById(user)).thenReturn(java.util.Optional.empty());
        mockMvc.perform(get("/api/notifications/preferences")
                        .header("X-User-Id", user))
                .andExpect(status().isOk())
                .AND(jsonPath("$.inAppEnabled").value(true))
                .AND(jsonPath("$.emailEnabled").value(true));
    }

    @Test
    void markAsRead_notFound_returns404() throws Exception {
        when(repo.findByIdAndRecipientId("missing", "user-int-1")).thenReturn(null);
        when(repo.existsById("missing")).thenReturn(false);

        mockMvc.perform(patch("/api/notifications/missing/read")
                        .header("X-User-Id", "user-int-1"))
                .andExpect(status().isNotFound())
                .AND(jsonPath("$.status").value(404));
    }

    @Test
    void markAsRead_wrongOwner_returns403() throws Exception {
        when(repo.findByIdAndRecipientId("n-9", "user-int-1")).thenReturn(null);
        when(repo.existsById("n-9")).thenReturn(true);

        mockMvc.perform(patch("/api/notifications/n-9/read")
                        .header("X-User-Id", "user-int-1"))
                .andExpect(status().isForbidden())
                .AND(jsonPath("$.status").value(403));
    }

    @Test
    void delete_missing_returns404() throws Exception {
        when(repo.findByIdAndRecipientId("missing", "user-int-1")).thenReturn(null);
        when(repo.existsById("missing")).thenReturn(false);

        mockMvc.perform(delete("/api/notifications/missing")
                        .header("X-User-Id", "user-int-1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatePreferences_inAppAlwaysOn() throws Exception {
        when(prefRepo.findById("user-int-1")).thenReturn(java.util.Optional.of(
                new com.clickcart.notification.model.NotificationPreference("user-int-1")));
        when(prefRepo.save(any())).thenReturn(new com.clickcart.notification.model.NotificationPreference("user-int-1"));

        mockMvc.perform(put("/api/notifications/preferences")
                        .header("X-User-Id", "user-int-1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"inAppEnabled":false,"emailEnabled":false,"disabledEventTypes":["booking.created"]}
                                """))
                .andExpect(status().isOk())
                .AND(jsonPath("$.inAppEnabled").value(true));
    }
}