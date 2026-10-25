package com.clickcart.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Collections;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.exception.UnauthorizedException;
import com.clickcart.model.Role;

class CurrentCustomerResolverTest {

    private static final String SECRET = "test-secret-that-is-long-enough-for-hs256-signing";
    private JwtUtil jwtUtil;
    private CurrentCustomerResolver resolver;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(SECRET, 15);
        ObjectProvider<JwtUtil> provider = new ObjectProvider<>() {
            @Override
            public JwtUtil getObject(Object... args) {
                return jwtUtil;
            }

            @Override
            public JwtUtil getIfAvailable() {
                return jwtUtil;
            }

            @Override
            public JwtUtil getIfUnique() {
                return jwtUtil;
            }

            @Override
            public JwtUtil getObject() {
                return jwtUtil;
            }
        };

        resolver = new CurrentCustomerResolver(provider);
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    @DisplayName("Throws UnauthorizedException when no authentication and no request context")
    void getCurrentCustomerId_unauthenticated_throwsUnauthorized() {
        assertThrows(UnauthorizedException.class, () -> resolver.getCurrentCustomerId());
    }

    @Test
    @DisplayName("Throws UnauthorizedException when principal is anonymousUser")
    void getCurrentCustomerId_anonymousUser_throwsUnauthorized() {
        Authentication auth = new UsernamePasswordAuthenticationToken("anonymousUser", null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThrows(UnauthorizedException.class, () -> resolver.getCurrentCustomerId());
    }

    @Test
    @DisplayName("Throws UnauthorizedException when principal is dev-provider-09")
    void getCurrentCustomerId_devProvider_throwsUnauthorized() {
        Authentication auth = new UsernamePasswordAuthenticationToken("dev-provider-09", null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThrows(UnauthorizedException.class, () -> resolver.getCurrentCustomerId());
    }

    @Test
    @DisplayName("Throws UnauthorizedException when principal is mock-customer-001")
    void getCurrentCustomerId_mockCustomer_throwsUnauthorized() {
        Authentication auth = new UsernamePasswordAuthenticationToken("mock-customer-001", null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        assertThrows(UnauthorizedException.class, () -> resolver.getCurrentCustomerId());
    }

    @Test
    @DisplayName("Returns customer ID when authenticated with AuthenticatedUser")
    void getCurrentCustomerId_authenticatedUser_returnsId() {
        AuthenticatedUser user = new AuthenticatedUser("cust-999", "cust@example.com", Role.CUSTOMER, null);
        Authentication auth = new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);

        String id = resolver.getCurrentCustomerId();
        assertEquals("cust-999", id);
    }

    @Test
    @DisplayName("Resolves customer ID from valid Bearer token in HttpServletRequest when security context is empty")
    void getCurrentCustomerId_fromBearerTokenInRequest_returnsId() {
        com.clickcart.model.User user = new com.clickcart.model.User();
        user.setId("cust-888");
        user.setEmail("token@example.com");
        user.setRole(Role.CUSTOMER);
        String token = jwtUtil.generateAccessToken(user);

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        String id = resolver.getCurrentCustomerId();
        assertEquals("cust-888", id);
    }

    @Test
    @DisplayName("Throws UnauthorizedException when request has empty Authorization header")
    void getCurrentCustomerId_emptyAuthHeader_throwsUnauthorized() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        assertThrows(UnauthorizedException.class, () -> resolver.getCurrentCustomerId());
    }

    @Test
    @DisplayName("Throws UnauthorizedException when request has Bearer without token")
    void getCurrentCustomerId_bearerOnlyHeader_throwsUnauthorized() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer ");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        assertThrows(UnauthorizedException.class, () -> resolver.getCurrentCustomerId());
    }
}
