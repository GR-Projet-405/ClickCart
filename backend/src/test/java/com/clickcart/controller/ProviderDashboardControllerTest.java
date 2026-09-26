package com.clickcart.controller;

import com.clickcart.service.ProviderDashboardService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProviderDashboardController.class)
@Import(ProviderDashboardService.class)
class ProviderDashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldReturnDashboardData() throws Exception {
        mockMvc.perform(get("/api/provider/dashboard")
                        .param("providerId", "PROV-1002")
                        .param("range", "7d")
                        .param("metric", "earnings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider.name").value("Kamal Perera"))
                .andExpect(jsonPath("$.provider.profileCompletion").value(92))
                .andExpect(jsonPath("$.performanceSummary.totalEarnings.formatted").value("LKR 125,680"))
                .andExpect(jsonPath("$.performanceSummary.jobsCompleted.count").value(24))
                .andExpect(jsonPath("$.performanceSummary.averageRating.score").value(4.9))
                .andExpect(jsonPath("$.performanceSummary.completionRate.rate").value(96.0))
                .andExpect(jsonPath("$.bookingPerformance.confirmed").value(8))
                .andExpect(jsonPath("$.bookingPerformance.completed").value(24))
                .andExpect(jsonPath("$.servicePerformance[0].title").value("AC Repair & Service"))
                .andExpect(jsonPath("$.todaySchedule[0].service").value("AC Repair & Service"));
    }
}
