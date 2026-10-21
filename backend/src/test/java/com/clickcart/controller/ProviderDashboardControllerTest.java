package com.clickcart.controller;

import com.clickcart.service.ProviderDashboardService;
import com.clickcart.service.ProviderProfileService;
import com.clickcart.model.JobStatus;
import com.clickcart.model.ProviderJob;
import com.clickcart.model.ProviderProfile;
import com.clickcart.model.Review;
import com.clickcart.repository.ProviderJobRepository;
import com.clickcart.repository.ReviewRepository;
import com.clickcart.repository.ProviderProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@WebMvcTest(ProviderDashboardController.class)
@Import(ProviderDashboardService.class)
@WithMockUser(username = "provider-b", roles = "SERVICE_PROVIDER")
class ProviderDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private com.clickcart.service.ProviderEarningService earningService;
    @MockitoBean private com.clickcart.service.ProviderVerificationService verificationService;
    @MockitoBean private ProviderJobRepository jobRepository;
    @MockitoBean private ReviewRepository reviewRepository;
    @MockitoBean private ProviderProfileRepository profileRepository;
    @MockitoBean private ProviderProfileService profileService;
    @MockitoBean(name = "mongoMappingContext") private MongoMappingContext mongoMappingContext;

    @BeforeEach
    void setUp() {
        String providerId = "provider-b";
        Instant today = LocalDate.now(ZoneId.of("Asia/Colombo"))
                .atTime(12, 0).atZone(ZoneId.of("Asia/Colombo")).toInstant();
        List<ProviderJob> jobs = new ArrayList<>();
        for (int i = 0; i < 32; i++) {
            ProviderJob job = new ProviderJob();
            job.setId("job-" + i);
            job.setProviderId(providerId);
            job.setServiceTitle("AC Repair & Service");
            job.setStatus(i < 24 ? JobStatus.COMPLETED : JobStatus.ACCEPTED);
            // Exact total: 23 * 5000 + 10680 = 125680.
            job.setNetPayout(i == 23 ? 10680.0 : 5000.0);
            job.setScheduledStart(today);
            job.setUpdatedAt(today);
            if (i < 24) job.setCompletedAt(today);
            jobs.add(job);
        }
        var earning = new com.clickcart.model.ProviderEarning(); earning.setNetAmount(new java.math.BigDecimal("125680")); earning.setCreatedAt(today);
        when(earningService.getRecordedEarnings(providerId)).thenReturn(List.of(earning));
        List<Review> reviews = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Review review = new Review();
            review.setRating(i == 0 ? 4 : 5);
            review.setCreatedAt(today);
            reviews.add(review);
        }
        ProviderProfile profile = new ProviderProfile();
        profile.setId(providerId);
        when(jobRepository.findByProviderIdOrderByScheduledStartAsc(providerId)).thenReturn(jobs);
        when(reviewRepository.findByProviderIdOrderByCreatedAtDesc(providerId)).thenReturn(reviews);
        when(profileRepository.findById(providerId)).thenReturn(Optional.of(profile));
        when(profileService.getOrCreateProfile(providerId)).thenReturn(new com.clickcart.dto.ProviderProfileResponse(
            providerId, "business", "", "QuickFix Electrical Services", "", "", "", "", "", "", "PARTIALLY_COMPLETED", 92, null, null));
    }

    @Test
    void shouldReturnDashboardData() throws Exception {
        mockMvc.perform(get("/api/provider/dashboard")
                        .param("providerId", "PROV-1002")
                        .param("range", "7d")
                        .param("metric", "earnings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider.name").value("QuickFix Electrical Services"))
                .andExpect(jsonPath("$.provider.profileCompletion").value(92))
                .andExpect(jsonPath("$.performanceSummary.totalEarnings.formatted").value("LKR 125,680"))
                .andExpect(jsonPath("$.performanceSummary.jobsCompleted.count").value(24))
                .andExpect(jsonPath("$.performanceSummary.averageRating.score").value(4.9))
                .andExpect(jsonPath("$.performanceSummary.completionRate.rate").value(75.0))
                .andExpect(jsonPath("$.bookingPerformance.confirmed").value(8))
                .andExpect(jsonPath("$.bookingPerformance.completed").value(24))
                .andExpect(jsonPath("$.servicePerformance[0].title").value("AC Repair & Service"))
                .andExpect(jsonPath("$.todaySchedule[0].service").value("AC Repair & Service"));
        verify(jobRepository).findByProviderIdOrderByScheduledStartAsc("provider-b");
        verify(reviewRepository).findByProviderIdOrderByCreatedAtDesc("provider-b");
    }
}
