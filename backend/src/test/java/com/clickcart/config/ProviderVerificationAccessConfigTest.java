package com.clickcart.config;

import com.clickcart.model.ProviderVerification;
import com.clickcart.repository.ProviderVerificationRepository;
import org.junit.jupiter.api.*;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProviderVerificationAccessConfigTest {
    ProviderVerificationRepository repository = mock(ProviderVerificationRepository.class);
    ProviderVerificationAccessConfig gate = new ProviderVerificationAccessConfig(repository);
    @BeforeEach void authenticate() {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("provider", null, List.of(new SimpleGrantedAuthority("ROLE_SERVICE_PROVIDER"))));
    }
    @AfterEach void cleanup() { SecurityContextHolder.clearContext(); }
    boolean request(String path, MockHttpServletResponse response) throws Exception {
        var request = new MockHttpServletRequest("POST", path); request.setServletPath(path);
        return gate.preHandle(request, response, new Object());
    }
    @Test void missingAndUnapprovedStatesAreBlocked() throws Exception {
        for (String status : List.of("MISSING", "DRAFT", "PENDING", "REJECTED")) {
            var record = new ProviderVerification(); record.setStatus(status);
            when(repository.findByUserId("provider")).thenReturn(status.equals("MISSING") ? Optional.empty() : Optional.of(record));
            var response = new MockHttpServletResponse();
            assertFalse(request("/api/provider/services", response)); assertEquals(403, response.getStatus());
        }
    }
    @Test void onboardingAndAccountSecurityStayAccessible() throws Exception {
        for (String path : List.of("/api/provider/profile", "/api/provider-verification/step1", "/api/provider-verification/step2", "/api/auth/change-password", "/api/auth/logout")) assertTrue(request(path,new MockHttpServletResponse()));
        verifyNoInteractions(repository);
    }
    @Test void approvedProviderCanWork() throws Exception {
        var record = new ProviderVerification(); record.setStatus("APPROVED");
        when(repository.findByUserId("provider")).thenReturn(Optional.of(record));
        assertTrue(request("/api/provider/jobs", new MockHttpServletResponse()));
    }
    @Test void customerIsNotSubjectToProviderGate() throws Exception {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("customer",null,List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))));
        assertTrue(request("/api/bookings",new MockHttpServletResponse())); verifyNoInteractions(repository);
    }
}
