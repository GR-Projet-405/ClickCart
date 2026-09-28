package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.clickcart.dto.ProviderProfileRequest;
import com.clickcart.dto.ProviderProfileResponse;
import com.clickcart.model.ProviderProfile;
import com.clickcart.repository.ProviderProfileRepository;

@ExtendWith(MockitoExtension.class)
class ProviderProfileServiceTest {

    @Mock
    private ProviderProfileRepository repository;

    @InjectMocks
    private ProviderProfileService service;

    private ProviderProfile emptyProfile;
    private ProviderProfile completedProfile;
    private ProviderProfile partialProfile;

    @BeforeEach
    void setUp() {
        emptyProfile = new ProviderProfile();
        emptyProfile.setId("prof1");
        emptyProfile.setProviderType("individual");

        completedProfile = new ProviderProfile();
        completedProfile.setId("prof2");
        completedProfile.setProviderType("individual");
        completedProfile.setFullName("Test Provider");
        completedProfile.setEmail("testprovider@example.com");
        completedProfile.setPhone("0771234567");
        completedProfile.setLocation("Colombo");
        completedProfile.setBio("Test bio");
        completedProfile.setCreatedAt(LocalDateTime.now());
        completedProfile.setUpdatedAt(LocalDateTime.now());

        partialProfile = new ProviderProfile();
        partialProfile.setId("prof3");
        partialProfile.setProviderType("individual");
        partialProfile.setFullName("Test Provider");
        partialProfile.setEmail("testprovider@example.com");
    }

    @Test
    @DisplayName("Calculate Status: NOT_STARTED when no required fields are populated")
    void testNotStartedStatus() {
        String status = service.calculateProfileStatus(emptyProfile);
        Integer percentage = service.calculateCompletionPercentage(emptyProfile);

        assertEquals("NOT_STARTED", status);
        assertEquals(0, percentage);
    }

    @Test
    @DisplayName("Calculate Status: PARTIALLY_COMPLETED (55%) when Name + Email are populated")
    void testPartialStatus() {
        String status = service.calculateProfileStatus(partialProfile);
        Integer percentage = service.calculateCompletionPercentage(partialProfile);

        assertEquals("PARTIALLY_COMPLETED", status);
        assertEquals(55, percentage); // Name (30) + Email (25) = 55
    }

    @Test
    @DisplayName("Calculate Status: COMPLETED (100%) when all required fields are populated")
    void testCompletedStatus() {
        String status = service.calculateProfileStatus(completedProfile);
        Integer percentage = service.calculateCompletionPercentage(completedProfile);

        assertEquals("COMPLETED", status);
        assertEquals(100, percentage);
    }

    @Test
    @DisplayName("Calculate Status: Business Provider requires both BusinessName and ContactPerson")
    void testBusinessProfileStatus() {
        ProviderProfile biz = new ProviderProfile();
        biz.setProviderType("business");
        biz.setBusinessName("ClickCart Ltd");
        biz.setEmail("info@clickcart.lk");

        // ContactPerson missing -> Name score = 0, Email = 25 -> 25% PARTIALLY_COMPLETED
        assertEquals("PARTIALLY_COMPLETED", service.calculateProfileStatus(biz));
        assertEquals(25, service.calculateCompletionPercentage(biz));

        biz.setContactPerson("Manager");
        // Now Name score = 30 + Email = 25 -> 55% PARTIALLY_COMPLETED
        assertEquals(55, service.calculateCompletionPercentage(biz));
    }

    @Test
    @DisplayName("Save Profile: Creates new entity and sets timestamps")
    void testSaveNewProfile() {
        when(repository.save(any(ProviderProfile.class))).thenAnswer(invocation -> {
            ProviderProfile arg = invocation.getArgument(0);
            if (arg.getId() == null) arg.setId("generatedId");
            return arg;
        });

        ProviderProfileRequest request = new ProviderProfileRequest(
                "individual", "Test Provider", "", "",
                "testprovider@example.com", "0771234567", "Colombo",
                "Bio text", ""
        );

        ProviderProfileResponse response = service.saveProfile(null, request);

        assertNotNull(response.getId());
        assertEquals("Test Provider", response.getFullName());
        assertEquals("COMPLETED", response.getProfileStatus());
        assertEquals(100, response.getCompletionPercentage());
        assertNotNull(response.getCreatedAt());
        assertNotNull(response.getUpdatedAt());
    }
}
