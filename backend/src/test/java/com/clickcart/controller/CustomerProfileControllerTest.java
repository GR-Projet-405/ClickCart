package com.clickcart.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.clickcart.dto.CustomerProfileDTO;
import com.clickcart.dto.CustomerProfileUpdateRequest;
import com.clickcart.exception.GlobalExceptionHandler;
import com.clickcart.exception.UnauthorizedException;
import com.clickcart.service.CustomerProfileService;
import com.clickcart.util.CurrentCustomerResolver;
import com.fasterxml.jackson.databind.ObjectMapper;

class CustomerProfileControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;
    private StubCustomerProfileService profileService;
    private StubCurrentCustomerResolver customerResolver;

    private CustomerProfileDTO sampleProfile;

    @BeforeEach
    void setUp() {
        profileService = new StubCustomerProfileService();
        customerResolver = new StubCurrentCustomerResolver();
        objectMapper = new ObjectMapper();

        CustomerProfileController controller = new CustomerProfileController(profileService, customerResolver);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleProfile = new CustomerProfileDTO();
        sampleProfile.setId("cust-12345");
        sampleProfile.setEmail("john.doe@example.com");
        sampleProfile.setFullName("John Doe");
        sampleProfile.setPreferredName("John");
        sampleProfile.setPhone("+94771234567");
        sampleProfile.setSavedAddresses(new ArrayList<>());
        sampleProfile.setRecentActivities(new ArrayList<>());
        profileService.profileToReturn = sampleProfile;
    }

    @Test
    @DisplayName("GET /api/customers/me/profile without token returns 401 Unauthorized")
    void getMyProfile_withoutToken_returns401() throws Exception {
        customerResolver.exceptionToThrow = new UnauthorizedException("Full authentication is required to access this resource");

        mockMvc.perform(get("/api/customers/me/profile")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("GET /api/customers/me/profile with empty Authorization header returns 401 Unauthorized")
    void getMyProfile_withEmptyAuthHeader_returns401() throws Exception {
        customerResolver.exceptionToThrow = new UnauthorizedException("Full authentication is required to access this resource");

        mockMvc.perform(get("/api/customers/me/profile")
                .header(HttpHeaders.AUTHORIZATION, "")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("GET /api/customers/me/profile with valid token returns 200 OK with customer profile")
    void getMyProfile_authenticated_returnsProfile() throws Exception {
        customerResolver.customerIdToReturn = "cust-12345";

        mockMvc.perform(get("/api/customers/me/profile")
                .header(HttpHeaders.AUTHORIZATION, "Bearer valid.token.here")
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("cust-12345"))
                .andExpect(jsonPath("$.fullName").value("John Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));
    }

    @Test
    @DisplayName("PUT /api/customers/me/profile without token returns 401 Unauthorized")
    void updateMyProfile_withoutToken_returns401() throws Exception {
        customerResolver.exceptionToThrow = new UnauthorizedException("Full authentication is required to access this resource");

        CustomerProfileUpdateRequest updateRequest = new CustomerProfileUpdateRequest();
        updateRequest.setFullName("John Updated");
        updateRequest.setEmail("john.doe@example.com");
        updateRequest.setPhone("+94771234567");

        mockMvc.perform(put("/api/customers/me/profile")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("PUT /api/customers/me/profile authenticated returns 200 OK")
    void updateMyProfile_authenticated_returnsUpdatedProfile() throws Exception {
        customerResolver.customerIdToReturn = "cust-12345";

        CustomerProfileUpdateRequest updateRequest = new CustomerProfileUpdateRequest();
        updateRequest.setFullName("John Updated");
        updateRequest.setEmail("john.doe@example.com");
        updateRequest.setPhone("+94771234567");

        mockMvc.perform(put("/api/customers/me/profile")
                .header(HttpHeaders.AUTHORIZATION, "Bearer valid.token.here")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateRequest))
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("John Updated"));
    }

    // Stubs to avoid Mockito classloader limitations on Java 26
    static class StubCustomerProfileService extends CustomerProfileService {
        CustomerProfileDTO profileToReturn;

        StubCustomerProfileService() {
            super(null, null);
        }

        @Override
        public CustomerProfileDTO getCustomerProfile(String customerId) {
            return profileToReturn;
        }

        @Override
        public CustomerProfileDTO updateCustomerProfile(String customerId, CustomerProfileUpdateRequest request) {
            CustomerProfileDTO updated = new CustomerProfileDTO();
            updated.setId(customerId);
            updated.setFullName(request.getFullName());
            return updated;
        }
    }

    static class StubCurrentCustomerResolver extends CurrentCustomerResolver {
        String customerIdToReturn;
        RuntimeException exceptionToThrow;

        StubCurrentCustomerResolver() {
            super(null);
        }

        @Override
        public String getCurrentCustomerId() {
            if (exceptionToThrow != null) {
                throw exceptionToThrow;
            }
            return customerIdToReturn;
        }
    }
}
