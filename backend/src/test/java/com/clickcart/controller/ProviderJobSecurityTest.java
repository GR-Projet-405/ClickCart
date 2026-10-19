package com.clickcart.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import com.clickcart.config.SecurityConfig;
import com.clickcart.exception.GlobalExceptionHandler;
import com.clickcart.model.JobStatus;
import com.clickcart.model.ProviderJob;
import com.clickcart.model.Role;
import com.clickcart.model.User;
import com.clickcart.repository.ProviderJobRepository;
import com.clickcart.service.JobProofStorageService;
import com.clickcart.service.ProviderJobService;
import com.clickcart.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.mongodb.core.mapping.MongoMappingContext;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(
    controllers = ProviderJobController.class,
    properties = {
        "clickcart.security.enabled=false",
        "CLICKCART_DEV_AUTH_FALLBACK=true",
        "JWT_SECRET=provider-job-test-secret-that-is-long-enough"
    }
)
@Import({SecurityConfig.class, ProviderJobService.class, GlobalExceptionHandler.class})
class ProviderJobSecurityTest {

    private static final String TEST_SECRET = "provider-job-test-secret-that-is-long-enough";
    private static final String JOB_ID = "job-a";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProviderJobRepository repository;

    @MockitoBean
    private JobProofStorageService storageService;

    @MockitoBean(name = "mongoMappingContext")
    private MongoMappingContext mongoMappingContext;

    @Autowired
    private JwtUtil jwtUtil;

    @Test
    void listRequiresAuthenticationAndReturnsOnlyAuthenticatedProvidersJobs() throws Exception {
        when(repository.findByProviderIdOrderByScheduledStartAsc("provider-a"))
            .thenReturn(List.of(job(JOB_ID, "provider-a", "Provider A private job")));

        mockMvc.perform(get("/api/provider/jobs"))
            .andExpect(status().isUnauthorized())
            .andExpect(content().string(not(containsString("Provider A private job"))));
        verify(repository, never()).findByProviderIdOrderByScheduledStartAsc("provider-a");

        mockMvc.perform(get("/api/provider/jobs")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token"))
            .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/provider/jobs")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + expiredToken("provider-a", Role.SERVICE_PROVIDER)))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/provider/jobs")
                .header(HttpHeaders.AUTHORIZATION, bearerToken("provider-a", Role.SERVICE_PROVIDER)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(JOB_ID))
            .andExpect(jsonPath("$[0].serviceTitle").value("Provider A private job"));

        verify(repository).findByProviderIdOrderByScheduledStartAsc("provider-a");
    }

    @Test
    void authenticatedNonProviderCannotListJobs() throws Exception {
        mockMvc.perform(get("/api/provider/jobs")
                .header(HttpHeaders.AUTHORIZATION, bearerToken("customer-1", Role.CUSTOMER)))
            .andExpect(status().isForbidden())
            .andExpect(content().string(not(containsString("job-a"))));
        verify(repository, never()).findByProviderIdOrderByScheduledStartAsc("customer-1");
    }

    @Test
    void validProvidersCanReadOnlyTheirOwnJobs() throws Exception {
        when(repository.findById(JOB_ID))
            .thenReturn(Optional.of(job(JOB_ID, "provider-a", "Provider A private job")));
        when(repository.findById("job-b"))
            .thenReturn(Optional.of(job("job-b", "provider-b", "Provider B private job")));

        mockMvc.perform(get("/api/provider/jobs/{jobId}", JOB_ID)
                .header(HttpHeaders.AUTHORIZATION, bearerToken("provider-a", Role.SERVICE_PROVIDER)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(JOB_ID))
            .andExpect(jsonPath("$.serviceTitle").value("Provider A private job"));

        mockMvc.perform(get("/api/provider/jobs/{jobId}", "job-b")
                .header(HttpHeaders.AUTHORIZATION, bearerToken("provider-b", Role.SERVICE_PROVIDER)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value("job-b"))
            .andExpect(jsonPath("$.serviceTitle").value("Provider B private job"));

        mockMvc.perform(get("/api/provider/jobs/{jobId}", JOB_ID)
                .header(HttpHeaders.AUTHORIZATION, bearerToken("provider-b", Role.SERVICE_PROVIDER)))
            .andExpect(status().isForbidden())
            .andExpect(content().string(not(containsString("Provider A private job"))));
    }

    @Test
    void jobReadRequiresAuthenticationAndPreservesNotFoundBehavior() throws Exception {
        mockMvc.perform(get("/api/provider/jobs/{jobId}", JOB_ID))
            .andExpect(status().isUnauthorized())
            .andExpect(content().string(not(containsString("Provider A private job"))));
        verify(repository, never()).findById(JOB_ID);

        when(repository.findById("missing-job")).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/provider/jobs/{jobId}", "missing-job")
                .header(HttpHeaders.AUTHORIZATION, bearerToken("provider-a", Role.SERVICE_PROVIDER)))
            .andExpect(status().isNotFound());
    }

    private String bearerToken(String providerId, Role role) {
        User user = new User();
        user.setId(providerId);
        user.setEmail(providerId + "@example.test");
        user.setRole(role);
        return "Bearer " + jwtUtil.generateAccessToken(user);
    }

    private static String expiredToken(String providerId, Role role) {
        JwtUtil expiredJwtUtil = new JwtUtil(TEST_SECRET, -1);
        User user = new User();
        user.setId(providerId);
        user.setEmail(providerId + "@example.test");
        user.setRole(role);
        return expiredJwtUtil.generateAccessToken(user);
    }

    private static ProviderJob job(String id, String providerId, String serviceTitle) {
        ProviderJob job = new ProviderJob();
        job.setId(id);
        job.setProviderId(providerId);
        job.setServiceTitle(serviceTitle);
        job.setStatus(JobStatus.PLACED);
        job.setDiagnostics(new ArrayList<>());
        job.setPhotos(new ArrayList<>());
        job.setChecklist(new ArrayList<>());
        return job;
    }
}
