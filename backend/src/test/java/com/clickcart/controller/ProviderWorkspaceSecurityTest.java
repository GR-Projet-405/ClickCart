package com.clickcart.controller;

import com.clickcart.config.SecurityConfig;
import com.clickcart.model.Role;
import com.clickcart.model.User;
import com.clickcart.service.ProviderProfileService;
import com.clickcart.service.ServiceListingService;
import com.clickcart.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = {ServiceListingController.class, ProviderProfileController.class}, properties = {
    "clickcart.security.enabled=false", "CLICKCART_DEV_AUTH_FALLBACK=true",
    "JWT_SECRET=provider-workspace-test-secret-that-is-long-enough"
})
@Import(SecurityConfig.class)
class ProviderWorkspaceSecurityTest {
    @Autowired MockMvc mvc;
    @Autowired JwtUtil tokens;
    @MockitoBean ServiceListingService services;
    @MockitoBean ProviderProfileService profiles;
    @MockitoBean(name = "mongoMappingContext") MongoMappingContext mapping;
    private String token(String id, Role role) {
        User user = new User(); user.setId(id); user.setEmail(id + "@example.com"); user.setRole(role);
        return "Bearer " + tokens.generateAccessToken(user);
    }
    @Test void realLoginTokensScopeServicesEvenWithSpoofedQueries() throws Exception {
        mvc.perform(get("/api/provider/services").param("providerId", "bob").header("Authorization", token("alice", Role.SERVICE_PROVIDER)))
            .andExpect(status().isOk());
        verify(services).findForProvider("alice");
        verify(services, never()).findForProvider("bob");
    }
    @Test void anonymousDevHeadersAndCustomerCannotReadProviderWorkspace() throws Exception {
        mvc.perform(get("/api/provider/services").header("X-Provider-Id", "alice").header("X-Dev-Role", "SERVICE_PROVIDER"))
            .andExpect(status().isUnauthorized());
        mvc.perform(get("/api/provider/profile").header("Authorization", token("customer", Role.CUSTOMER)))
            .andExpect(status().isForbidden());
        verifyNoInteractions(services, profiles);
    }
    @Test void providerCannotOverwriteAnotherAccountProfile() throws Exception {
        mvc.perform(put("/api/provider/profile").param("id", "bob")
                .header("Authorization", token("alice", Role.SERVICE_PROVIDER))
                .contentType("application/json").content("{\"providerType\":\"individual\",\"fullName\":\"Changed\"}"))
            .andExpect(status().isForbidden());
        verifyNoInteractions(profiles);
    }
}
