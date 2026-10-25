package com.clickcart.controller;

import com.clickcart.dto.FavoriteResponseDTO;
import com.clickcart.model.*;
import com.clickcart.repository.*;
import com.clickcart.service.FavoriteService;
import com.clickcart.security.CurrentCustomer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
    private final FavoriteService favorites;
    private final ServiceListingRepository services;
    private final ProviderProfileRepository profiles;
    private final UserRepository users;
    public FavoriteController(FavoriteService favorites, ServiceListingRepository services, ProviderProfileRepository profiles, UserRepository users) {
        this.favorites = favorites; this.services = services; this.profiles = profiles; this.users = users;
    }
    private String owner(String requested) {
        String id = CurrentCustomer.id();
        if (requested != null && !requested.equals("me") && !requested.equals(id)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access your own favorites");
        return id;
    }
    private String type(String value) {
        if (value == null || !Set.of("SERVICE", "PROVIDER").contains(value.toUpperCase(Locale.ROOT))) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a service or provider");
        return value.toUpperCase(Locale.ROOT);
    }
    @GetMapping({"", "/me"})
    public List<FavoriteResponseDTO> mine() { return list(owner(null)); }
    @GetMapping("/{customerId}")
    public List<FavoriteResponseDTO> forCustomer(@PathVariable String customerId) { return list(owner(customerId)); }
    private List<FavoriteResponseDTO> list(String customerId) {
        return favorites.getCustomerFavorites(customerId).stream().map(this::details).filter(Objects::nonNull).toList();
    }
    @PostMapping
    public Favorite add(@RequestBody Favorite request) {
        String customerId = owner(request.getCustomerId());
        String kind = type(request.getTargetType());
        String target = request.getTargetId();
        if (target == null || target.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A target is required");
        boolean exists = kind.equals("SERVICE") ? services.findById(target).filter(s -> s.getStatus() == ServiceListingStatus.ACTIVE).isPresent()
                : users.findById(target).filter(u -> u.getRole() == Role.SERVICE_PROVIDER).isPresent();
        if (!exists) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "This service or provider is no longer available");
        return favorites.addFavorite(customerId, kind, target);
    }
    @DeleteMapping("/{targetType}/{targetId}")
    public ResponseEntity<Void> remove(@PathVariable String targetType, @PathVariable String targetId) {
        favorites.removeFavorite(owner(null), type(targetType), targetId); return ResponseEntity.noContent().build();
    }
    @DeleteMapping("/{customerId}/{targetType}/{targetId}")
    public ResponseEntity<Void> removeForCustomer(@PathVariable String customerId, @PathVariable String targetType, @PathVariable String targetId) {
        favorites.removeFavorite(owner(customerId), type(targetType), targetId); return ResponseEntity.noContent().build();
    }
    private FavoriteResponseDTO details(Favorite f) {
        FavoriteResponseDTO d = new FavoriteResponseDTO();
        d.setId(f.getId()); d.setCustomerId(f.getCustomerId()); d.setTargetId(f.getTargetId()); d.setTargetType(f.getTargetType()); d.setCreatedAt(f.getCreatedAt());
        if ("SERVICE".equals(f.getTargetType())) {
            var s = services.findById(f.getTargetId()).orElse(null);
            if (s == null) return null;
            d.setTitle(s.getTitle()); d.setDescription(s.getDescription()); d.setCategory(s.getCategory()); d.setLocation(s.getLocation());
            d.setPrice(s.getPriceFrom() == null ? "Contact for pricing" : "LKR " + s.getPriceFrom().toPlainString());
            d.setImage(s.getImageUrl()); d.setRating(s.getRating()); d.setReviewsCount(s.getReviewsCount());
            d.setProviderName(users.findById(s.getProviderId()).map(User::getFullName).orElse("Provider unavailable"));
            d.setAvailability(s.getStatus() == ServiceListingStatus.ACTIVE ? s.getAvailability() : "Unavailable");
        } else if ("PROVIDER".equals(f.getTargetType())) {
            var u = users.findById(f.getTargetId()).filter(user -> user.getRole() == Role.SERVICE_PROVIDER).orElse(null);
            if (u == null) return null;
            d.setTitle(u.getFullName()); d.setProviderName(u.getFullName());
            profiles.findById(f.getTargetId()).ifPresent(p -> {
                String name = "business".equalsIgnoreCase(p.getProviderType()) && p.getBusinessName() != null ? p.getBusinessName() : p.getFullName();
                if (name != null && !name.isBlank()) { d.setTitle(name); d.setProviderName(name); }
                d.setImage(p.getProfileImage()); d.setDescription(p.getBio()); d.setCategory(p.getServiceCategory()); d.setLocation(p.getLocation());
                d.setRating(p.getRating()); d.setReviewsCount(p.getReviewCount());
            });
        } else return null;
        return d;
    }
}
