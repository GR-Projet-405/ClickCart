package com.clickcart.controller;

import com.clickcart.model.*;
import com.clickcart.repository.*;
import com.clickcart.service.FavoriteService;
import com.clickcart.exception.*;
import org.junit.jupiter.api.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class FavoriteControllerTest {
    FavoriteService favorites = mock(FavoriteService.class);
    ServiceListingRepository services = mock(ServiceListingRepository.class);
    ProviderProfileRepository profiles = mock(ProviderProfileRepository.class);
    UserRepository users = mock(UserRepository.class);
    FavoriteController controller = new FavoriteController(favorites, services, profiles, users);
    @BeforeEach void login() { SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("customer-a", null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")))); }
    @AfterEach void clear() { SecurityContextHolder.clearContext(); }
    @Test void emptyAccountDoesNotSeedFavorites() {
        when(favorites.getCustomerFavorites("customer-a")).thenReturn(List.of());
        assertTrue(controller.mine().isEmpty()); verify(favorites, never()).addFavorite(any(), any(), any());
    }
    @Test void rejectsForeignAccountReadWriteAndDelete() {
        assertThrows(ResponseStatusException.class, () -> controller.forCustomer("customer-b"));
        assertThrows(ResponseStatusException.class, () -> controller.add(new Favorite("customer-b", "SERVICE", "s")));
        assertThrows(ResponseStatusException.class, () -> controller.removeForCustomer("customer-b", "SERVICE", "s"));
        verifyNoInteractions(favorites);
    }
    @Test void saveUsesAuthenticatedCustomerAndValidatesTarget() {
        ServiceListing s = new ServiceListing(); s.setStatus(ServiceListingStatus.ACTIVE);
        when(services.findById("service")).thenReturn(Optional.of(s));
        controller.add(new Favorite(null,"service","service"));
        verify(favorites).addFavorite("customer-a","SERVICE","service");
        assertThrows(ResponseStatusException.class, () -> controller.add(new Favorite(null,"OTHER","service")));
        assertThrows(ResponseStatusException.class, () -> controller.add(new Favorite(null,"SERVICE","missing")));
    }
    @Test void resolvesRealServiceMetadataAndSkipsDeletedTargets() {
        Favorite f = new Favorite("customer-a","SERVICE","real-service");
        when(favorites.getCustomerFavorites("customer-a")).thenReturn(List.of(f, new Favorite("customer-a","SERVICE","s1")));
        ServiceListing s = new ServiceListing(); s.setTitle("Actual service"); s.setPriceFrom(new BigDecimal("3750")); s.setProviderId("provider"); s.setStatus(ServiceListingStatus.ACTIVE);
        when(services.findById("real-service")).thenReturn(Optional.of(s));
        User u = new User(); u.setFullName("Actual provider"); when(users.findById("provider")).thenReturn(Optional.of(u));
        var result = controller.mine(); assertEquals(1,result.size()); assertEquals("Actual service",result.get(0).getTitle()); assertEquals("LKR 3750",result.get(0).getPrice()); assertEquals("Actual provider",result.get(0).getProviderName());
    }
    @Test void providerSaveAndDetailsUseDatabaseProfile() {
        User u = new User(); u.setRole(Role.SERVICE_PROVIDER); u.setFullName("Provider"); when(users.findById("provider")).thenReturn(Optional.of(u));
        var p = new ProviderProfile(); p.setProviderType("business"); p.setBusinessName("Actual business"); when(profiles.findById("provider")).thenReturn(Optional.of(p));
        controller.add(new Favorite(null,"PROVIDER","provider")); verify(favorites).addFavorite("customer-a","PROVIDER","provider");
        when(favorites.getCustomerFavorites("customer-a")).thenReturn(List.of(new Favorite("customer-a","PROVIDER","provider")));
        assertEquals("Actual business",controller.mine().get(0).getTitle());
    }
    @Test void removalIsScopedToCurrentCustomer() {
        controller.remove("service","service"); verify(favorites).removeFavorite("customer-a","SERVICE","service");
    }
    @Test void requiresCustomerAuthentication() {
        SecurityContextHolder.clearContext(); assertThrows(UnauthorizedException.class,controller::mine);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken("provider",null,List.of(new SimpleGrantedAuthority("ROLE_SERVICE_PROVIDER"))));
        assertThrows(ForbiddenException.class,controller::mine);
    }
}
