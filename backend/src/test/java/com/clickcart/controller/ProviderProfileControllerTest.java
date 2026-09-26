package com.clickcart.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.clickcart.dto.ProviderProfileRequest;
import com.clickcart.dto.ProviderProfileResponse;
import com.clickcart.model.ProviderProfile;
import com.clickcart.service.ProviderProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(controllers = {HealthController.class, ProviderProfileController.class})
class ProviderProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProviderProfileService providerProfileService;

    private ProviderProfileResponse defaultResponse;
    private ProviderProfileResponse completedResponse;
    private ProviderProfileResponse partialResponse;

    @BeforeEach
    void setUp() {
        defaultResponse = new ProviderProfileResponse(
                "67890def", "individual", "", "", "", "", "", "", "", "",
                "NOT_STARTED", 0, "2026-09-25T12:00:00", "2026-09-25T12:00:00"
        );

        completedResponse = new ProviderProfileResponse(
                "12345abc", "individual", "Test Provider", "", "",
                "testprovider@example.com", "0771234567", "Colombo",
                "Test provider profile", "", "COMPLETED", 100,
                "2026-09-25T12:00:00", "2026-09-25T12:00:00"
        );

        partialResponse = new ProviderProfileResponse(
                "12345abc", "individual", "Test Provider", "", "",
                "testprovider@example.com", "", "",
                "", "", "PARTIALLY_COMPLETED", 55,
                "2026-09-25T12:00:00", "2026-09-25T12:05:00"
        );
    }

    @Test
    @DisplayName("STEP 2: GET /api/health should return HTTP 200 with UP status")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.application").value("ClickCart"));
    }

    @Test
    @DisplayName("STEP 3: GET /api/provider/profile should return HTTP 200 and ProviderProfileResponse")
    void testGetDefaultProfile() throws Exception {
        Mockito.when(providerProfileService.getOrCreateDefaultProfile()).thenReturn(defaultResponse);

        mockMvc.perform(get("/api/provider/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("67890def"))
                .andExpect(jsonPath("$.profileStatus").value("NOT_STARTED"))
                .andExpect(jsonPath("$.completionPercentage").value(0));
    }

    @Test
    @DisplayName("STEP 4: PUT /api/provider/profile should create/update and return COMPLETED status (100%)")
    void testCreateCompletedProfile() throws Exception {
        Mockito.when(providerProfileService.getOrCreateDefaultProfile()).thenReturn(defaultResponse);
        Mockito.when(providerProfileService.saveProfile(eq("67890def"), any(ProviderProfileRequest.class)))
                .thenReturn(completedResponse);

        ProviderProfileRequest request = new ProviderProfileRequest(
                "individual", "Test Provider", "", "",
                "testprovider@example.com", "0771234567", "Colombo",
                "Test provider profile", ""
        );

        mockMvc.perform(put("/api/provider/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("12345abc"))
                .andExpect(jsonPath("$.fullName").value("Test Provider"))
                .andExpect(jsonPath("$.email").value("testprovider@example.com"))
                .andExpect(jsonPath("$.phone").value("0771234567"))
                .andExpect(jsonPath("$.location").value("Colombo"))
                .andExpect(jsonPath("$.profileStatus").value("COMPLETED"))
                .andExpect(jsonPath("$.completionPercentage").value(100));
    }

    @Test
    @DisplayName("STEP 5: GET /api/provider/profile/{id} should return public profile by ID")
    void testGetProfileById() throws Exception {
        Mockito.when(providerProfileService.getPublicProfile("12345abc")).thenReturn(completedResponse);

        mockMvc.perform(get("/api/provider/profile/12345abc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("12345abc"))
                .andExpect(jsonPath("$.fullName").value("Test Provider"))
                .andExpect(jsonPath("$.profileStatus").value("COMPLETED"));
    }

    @Test
    @DisplayName("STEP 6: PUT /api/provider/profile?id={id} partial profile should return PARTIALLY_COMPLETED (55%)")
    void testUpdatePartialProfile() throws Exception {
        Mockito.when(providerProfileService.saveProfile(eq("12345abc"), any(ProviderProfileRequest.class)))
                .thenReturn(partialResponse);

        ProviderProfileRequest request = new ProviderProfileRequest(
                "individual", "Test Provider", "", "",
                "testprovider@example.com", "", "", "", ""
        );

        mockMvc.perform(put("/api/provider/profile?id=12345abc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("12345abc"))
                .andExpect(jsonPath("$.fullName").value("Test Provider"))
                .andExpect(jsonPath("$.email").value("testprovider@example.com"))
                .andExpect(jsonPath("$.phone").value(""))
                .andExpect(jsonPath("$.location").value(""))
                .andExpect(jsonPath("$.profileStatus").value("PARTIALLY_COMPLETED"))
                .andExpect(jsonPath("$.completionPercentage").value(55));
    }

    @Test
    @DisplayName("STEP 8: Verification that ProviderProfile entity does not contain calculated fields")
    void testEntityFieldConstraints() {
        ProviderProfile profile = new ProviderProfile();
        profile.setId("testId");
        profile.setProviderType("individual");
        profile.setFullName("Test");

        // Verify entity standard fields exist
        assertEquals("testId", profile.getId());
        assertEquals("individual", profile.getProviderType());
        assertEquals("Test", profile.getFullName());

        // Verify that entity class has no profileStatus or completionPercentage fields/methods
        assertThrows(NoSuchFieldException.class, () -> ProviderProfile.class.getDeclaredField("profileStatus"));
        assertThrows(NoSuchFieldException.class, () -> ProviderProfile.class.getDeclaredField("completionPercentage"));
    }
}
