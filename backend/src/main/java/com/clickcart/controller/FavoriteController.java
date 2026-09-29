package com.clickcart.controller;

import com.clickcart.dto.FavoriteResponseDTO;
import com.clickcart.model.Favorite;
import com.clickcart.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:5173")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    // GET all favorites for a customer (returns full details)
    @GetMapping("/{customerId}")
    public ResponseEntity<List<FavoriteResponseDTO>> getMyFavorites(@PathVariable String customerId) {
        List<Favorite> favorites = favoriteService.getCustomerFavorites(customerId);
        List<FavoriteResponseDTO> response = new ArrayList<>();

        for (Favorite fav : favorites) {
            FavoriteResponseDTO dto = new FavoriteResponseDTO();
            dto.setId(fav.getId());
            dto.setTargetType(fav.getTargetType());
            dto.setTargetId(fav.getTargetId());

            // Mock data — replace with real lookups from ServiceRepository later
            if ("s1".equals(fav.getTargetId()) || "p1".equals(fav.getTargetId())) {
                dto.setTitle("Garden Maintenance");
                dto.setProviderName("Liam S.");
                dto.setPrice("LKR 2,500");
                dto.setRating(4.8);
                dto.setImage("https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&q=80&w=200&h=150");
            } else if ("s2".equals(fav.getTargetId()) || "p2".equals(fav.getTargetId())) {
                dto.setTitle("Fresh Home Care");
                dto.setProviderName("Maria C.");
                dto.setPrice("LKR 1,850");
                dto.setRating(4.9);
                dto.setImage("https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=200&h=150");
            } else {
                dto.setTitle("Electrical Repairs");
                dto.setProviderName("Rajiv K.");
                dto.setPrice("LKR 3,500");
                dto.setRating(4.7);
                dto.setImage("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=200&h=150");
            }

            response.add(dto);
        }

        return ResponseEntity.ok(response);
    }

    // POST: Add a favorite (customerId comes from body, not Authentication)
    @PostMapping
    public ResponseEntity<Favorite> addFavorite(@RequestBody Favorite request) {
        Favorite saved = favoriteService.addFavorite(
            request.getCustomerId(),
            request.getTargetType(),
            request.getTargetId()
        );
        return ResponseEntity.ok(saved);
    }

    // DELETE: Remove a favorite
    @DeleteMapping("/{customerId}/{targetType}/{targetId}")
    public ResponseEntity<Void> removeFavorite(
        @PathVariable String customerId,
        @PathVariable String targetType,
        @PathVariable String targetId) {
        favoriteService.removeFavorite(customerId, targetType, targetId);
        return ResponseEntity.noContent().build();
    }
}
