package com.clickcart.service;

import com.clickcart.model.ProviderProfile;
import com.clickcart.model.ProviderType;
import com.clickcart.model.User;
import com.clickcart.repository.ProviderProfileRepository;
import com.clickcart.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProviderOnboardingIsolationTest {
    @Test void newAccountUsesRegistrationDetailsAndNeverReadsFirstProfile() {
        ProviderProfileRepository profiles = mock(ProviderProfileRepository.class);
        UserRepository users = mock(UserRepository.class);
        ProviderProfileService service = new ProviderProfileService(profiles);
        ReflectionTestUtils.setField(service, "users", users);
        User alice = new User();
        alice.setId("alice"); alice.setFullName("Alice"); alice.setEmail("alice@example.com");
        alice.setPhone("+94771234567"); alice.setProviderType(ProviderType.INDIVIDUAL);
        when(profiles.findById("alice")).thenReturn(Optional.empty());
        when(users.findById("alice")).thenReturn(Optional.of(alice));
        var response = service.getOrCreateProfile("alice");
        assertEquals("alice", response.getId());
        assertEquals("Alice", response.getFullName());
        assertEquals("alice@example.com", response.getEmail());
        assertEquals("PARTIALLY_COMPLETED", response.getProfileStatus());
        verify(profiles, never()).findAll();
        verify(profiles, never()).save(any());
    }

    @Test void existingAccountLoadsOnlyItsOwnProfile() {
        ProviderProfileRepository profiles = mock(ProviderProfileRepository.class);
        ProviderProfileService service = new ProviderProfileService(profiles);
        ProviderProfile bob = new ProviderProfile(); bob.setId("bob"); bob.setFullName("Bob");
        when(profiles.findById("bob")).thenReturn(Optional.of(bob));
        assertEquals("Bob", service.getOrCreateProfile("bob").getFullName());
        verify(profiles).findById("bob");
        verifyNoMoreInteractions(profiles);
    }
}
