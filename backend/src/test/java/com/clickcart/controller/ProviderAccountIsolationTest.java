package com.clickcart.controller;

import com.clickcart.dto.ProviderProfileRequest;
import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.UnauthorizedException;
import com.clickcart.model.ProviderType;
import com.clickcart.model.Role;
import com.clickcart.security.CurrentProvider;
import com.clickcart.service.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProviderAccountIsolationTest {
    private void signIn(String id, Role role) {
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
            new AuthenticatedUser(id, id + "@example.com", role, ProviderType.INDIVIDUAL), null,
            List.of(new SimpleGrantedAuthority(role.authority()))));
    }
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }

    @Test void listIgnoresSpoofedProviderQueryAndSwitchesAccount() {
        ServiceListingService service = mock(ServiceListingService.class);
        ServiceListingController controller = new ServiceListingController(service);
        signIn("alice", Role.SERVICE_PROVIDER);
        controller.list("bob");
        verify(service).findForProvider("alice");
        signIn("bob", Role.SERVICE_PROVIDER);
        controller.list("alice");
        verify(service).findForProvider("bob");
        verifyNoMoreInteractions(service);
    }

    @Test void profileSaveUsesSignedInIdAndRejectsAnotherProfileId() {
        ProviderProfileService service = mock(ProviderProfileService.class);
        ProviderProfileController controller = new ProviderProfileController(service);
        ProviderProfileRequest request = new ProviderProfileRequest("individual", "Alice", "", "", "a@example.com", "0771234567", "Colombo", "", "");
        signIn("alice", Role.SERVICE_PROVIDER);
        controller.updateProfile(null, request);
        verify(service).saveProfile("alice", request);
        assertThrows(ForbiddenException.class, () -> controller.updateProfile("bob", request));
        verifyNoMoreInteractions(service);
    }

    @Test void bookingsIgnoreSpoofedIdentityHeader() {
        BookingService service = mock(BookingService.class);
        ProviderBookingController controller = new ProviderBookingController(service);
        signIn("alice", Role.SERVICE_PROVIDER);
        controller.get("bob", "booking-b");
        verify(service).get("booking-b", "alice");
    }

    @Test void anonymousAndCustomerCannotResolveProviderIdentity() {
        assertThrows(UnauthorizedException.class, CurrentProvider::id);
        signIn("customer", Role.CUSTOMER);
        assertThrows(ForbiddenException.class, CurrentProvider::id);
    }
}
