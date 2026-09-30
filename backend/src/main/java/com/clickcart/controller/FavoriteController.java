package com.clickcart.controller;

import com.clickcart.dto.FavoriteResponseDTO;
import com.clickcart.model.Favorite;
import com.clickcart.model.ServiceListing;
import com.clickcart.repository.ServiceListingRepository;
import com.clickcart.service.FavoriteService;
import com.clickcart.util.CurrentCustomerResolver;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @Autowired(required = false)
    private CurrentCustomerResolver currentCustomerResolver;

    @Autowired(required = false)
    private ServiceListingRepository serviceListingRepository;

    private static final Map<String, FavoriteResponseDTO> CATALOG = new HashMap<>();

    static {
        // Saved Services Seed Catalog
        FavoriteResponseDTO s1 = new FavoriteResponseDTO();
        s1.setTargetId("s1");
        s1.setTargetType("SERVICE");
        s1.setTitle("Garden Maintenance & Landscaping");
        s1.setProviderName("GreenCare Solutions (Liam S.)");
        s1.setCategory("Gardening");
        s1.setLocation("Colombo 07 & Cinnamon Gardens");
        s1.setPrice("LKR 3,500");
        s1.setRating(4.9);
        s1.setReviewsCount(48);
        s1.setBadge("Top Rated");
        s1.setAvailability("Available Tomorrow");
        s1.setDescription("Complete lawn mowing, hedge trimming, weed treatment, and seasonal plant nourishment.");
        s1.setImage("https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&q=80&w=600&h=400");
        CATALOG.put("s1", s1);

        FavoriteResponseDTO s2 = new FavoriteResponseDTO();
        s2.setTargetId("s2");
        s2.setTargetType("SERVICE");
        s2.setTitle("Deep House Cleaning & Sanitization");
        s2.setProviderName("Sparkle Home Care (Maria C.)");
        s2.setCategory("Home Cleaning");
        s2.setLocation("Colombo & Western Province");
        s2.setPrice("LKR 4,800");
        s2.setRating(4.85);
        s2.setReviewsCount(82);
        s2.setBadge("Eco-Friendly");
        s2.setAvailability("Available Today");
        s2.setDescription("Comprehensive room-by-room deep scrub, kitchen degreasing, bathroom disinfecting, and floor polishing.");
        s2.setImage("https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600&h=400");
        CATALOG.put("s2", s2);

        FavoriteResponseDTO s3 = new FavoriteResponseDTO();
        s3.setTargetId("s3");
        s3.setTargetType("SERVICE");
        s3.setTitle("Master AC Inverter Servicing & Repair");
        s3.setProviderName("CoolBreeze HVAC Ltd. (Rajiv K.)");
        s3.setCategory("AC & Appliances");
        s3.setLocation("Colombo 03 / Kollupitiya");
        s3.setPrice("LKR 4,200");
        s3.setRating(4.92);
        s3.setReviewsCount(64);
        s3.setBadge("Certified Pro");
        s3.setAvailability("Next Slot: 2:30 PM");
        s3.setDescription("Gas pressure check, high-pressure coil wash, master filter disinfection, and electrical current inspection.");
        s3.setImage("https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600&h=400");
        CATALOG.put("s3", s3);

        FavoriteResponseDTO s4 = new FavoriteResponseDTO();
        s4.setTargetId("s4");
        s4.setTargetType("SERVICE");
        s4.setTitle("Emergency Pipe Leak & Drain Plumbing");
        s4.setProviderName("QuickFix Plumbers Sri Lanka");
        s4.setCategory("Plumbing");
        s4.setLocation("Dehiwala & Mount Lavinia");
        s4.setPrice("LKR 2,800");
        s4.setRating(4.78);
        s4.setReviewsCount(37);
        s4.setBadge("24/7 Available");
        s4.setAvailability("30 Min Response");
        s4.setDescription("Fast response leak isolation, PVC & PPR repair, high pressure clog clearance, and valve replacement.");
        s4.setImage("https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=600&h=400");
        CATALOG.put("s4", s4);

        // Saved Providers Seed Catalog
        FavoriteResponseDTO p1 = new FavoriteResponseDTO();
        p1.setTargetId("p1");
        p1.setTargetType("PROVIDER");
        p1.setTitle("Liam Senanayake");
        p1.setProviderName("Liam Senanayake");
        p1.setCategory("Gardening & Horticulture");
        p1.setLocation("Colombo 07, Western Province");
        p1.setPrice("LKR 3,000 / hr");
        p1.setRating(4.95);
        p1.setReviewsCount(142);
        p1.setBadge("Master Specialist");
        p1.setAvailability("Available Weekdays & Sat");
        p1.setDescription("Certified arborist and landscaping architect with 9+ years experience transforming residential and commercial gardens.");
        p1.setImage("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400");
        p1.setPhone("+94 77 456 7890");
        p1.setEmail("liam.gardens@clickcart.lk");
        CATALOG.put("p1", p1);

        FavoriteResponseDTO p2 = new FavoriteResponseDTO();
        p2.setTargetId("p2");
        p2.setTargetType("PROVIDER");
        p2.setTitle("Maria Corelli");
        p2.setProviderName("Maria Corelli");
        p2.setCategory("Home Sanitization & Housekeeping");
        p2.setLocation("Colombo 03 / Bambalapitiya");
        p2.setPrice("LKR 2,500 / hr");
        p2.setRating(4.88);
        p2.setReviewsCount(98);
        p2.setBadge("Fast Responder");
        p2.setAvailability("Available 7 Days a Week");
        p2.setDescription("Professional sanitization crew lead. Uses non-toxic, hospital-grade equipment for allergen-free living spaces.");
        p2.setImage("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400");
        p2.setPhone("+94 71 234 8901");
        p2.setEmail("maria.sparkle@clickcart.lk");
        CATALOG.put("p2", p2);

        FavoriteResponseDTO p3 = new FavoriteResponseDTO();
        p3.setTargetId("p3");
        p3.setTargetType("PROVIDER");
        p3.setTitle("Rajiv Kumaratunga");
        p3.setProviderName("Rajiv Kumaratunga");
        p3.setCategory("Electrical & Inverter HVAC");
        p3.setLocation("Dehiwala / Mount Lavinia");
        p3.setPrice("LKR 3,200 / hr");
        p3.setRating(4.91);
        p3.setReviewsCount(215);
        p3.setBadge("Licensed Engineer");
        p3.setAvailability("Emergency & Scheduled");
        p3.setDescription("Certified senior electrical engineer specializing in residential surge protection, inverter ACs, and smart home setups.");
        p3.setImage("https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400");
        p3.setPhone("+94 76 890 1234");
        p3.setEmail("rajiv.fix@clickcart.lk");
        CATALOG.put("p3", p3);
    }

    private void ensureDefaultFavorites(String customerId) {
        List<Favorite> current = favoriteService.getCustomerFavorites(customerId);
        if (current.isEmpty()) {
            favoriteService.addFavorite(customerId, "SERVICE", "s1");
            favoriteService.addFavorite(customerId, "SERVICE", "s2");
            favoriteService.addFavorite(customerId, "SERVICE", "s3");
            favoriteService.addFavorite(customerId, "PROVIDER", "p1");
            favoriteService.addFavorite(customerId, "PROVIDER", "p2");
            favoriteService.addFavorite(customerId, "PROVIDER", "p3");
        }
    }

    private String resolveCustomerId(String fallback) {
        if (fallback != null && !fallback.trim().isEmpty() && !fallback.equals("me")) {
            return fallback;
        }
        if (currentCustomerResolver != null) {
            return currentCustomerResolver.getCurrentCustomerId();
        }
        return "mock-customer-001";
    }

    // GET favorites for current logged in customer
    @GetMapping({"", "/me"})
    public ResponseEntity<List<FavoriteResponseDTO>> getMyActiveFavorites() {
        String customerId = resolveCustomerId(null);
        return getMyFavorites(customerId);
    }

    // GET all favorites for a customer (returns full details)
    @GetMapping("/{customerId}")
    public ResponseEntity<List<FavoriteResponseDTO>> getMyFavorites(@PathVariable String customerId) {
        String effectiveCustomerId = resolveCustomerId(customerId);
        ensureDefaultFavorites(effectiveCustomerId);

        List<Favorite> favorites = favoriteService.getCustomerFavorites(effectiveCustomerId);
        List<FavoriteResponseDTO> response = new ArrayList<>();

        for (Favorite fav : favorites) {
            FavoriteResponseDTO dto = new FavoriteResponseDTO();
            dto.setId(fav.getId());
            dto.setCustomerId(fav.getCustomerId());
            dto.setTargetType(fav.getTargetType());
            dto.setTargetId(fav.getTargetId());
            dto.setCreatedAt(fav.getCreatedAt() != null ? fav.getCreatedAt() : LocalDateTime.now());

            // Check if catalog has predefined rich metadata
            FavoriteResponseDTO meta = CATALOG.get(fav.getTargetId());
            if (meta != null) {
                dto.setTitle(meta.getTitle());
                dto.setProviderName(meta.getProviderName());
                dto.setCategory(meta.getCategory());
                dto.setLocation(meta.getLocation());
                dto.setPrice(meta.getPrice());
                dto.setRating(meta.getRating());
                dto.setReviewsCount(meta.getReviewsCount());
                dto.setImage(meta.getImage());
                dto.setBadge(meta.getBadge());
                dto.setAvailability(meta.getAvailability());
                dto.setDescription(meta.getDescription());
                dto.setPhone(meta.getPhone());
                dto.setEmail(meta.getEmail());
            } else {
                // Dynamic fallback if saved from elsewhere
                if ("SERVICE".equalsIgnoreCase(fav.getTargetType())) {
                    dto.setTitle("Service #" + fav.getTargetId());
                    dto.setProviderName("Verified Provider");
                    dto.setCategory("Home Services");
                    dto.setLocation("Colombo, Western Province");
                    dto.setPrice("LKR 2,500");
                    dto.setRating(4.8);
                    dto.setReviewsCount(15);
                    dto.setImage("https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400&h=250");
                    dto.setBadge("Verified");
                    dto.setAvailability("Available");
                } else {
                    dto.setTitle("Service Provider");
                    dto.setProviderName("Provider #" + fav.getTargetId());
                    dto.setCategory("General Services");
                    dto.setLocation("Colombo, Sri Lanka");
                    dto.setPrice("LKR 2,000 / hr");
                    dto.setRating(4.9);
                    dto.setReviewsCount(28);
                    dto.setImage("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400");
                    dto.setBadge("Verified Pro");
                    dto.setAvailability("Active");
                }
            }

            response.add(dto);
        }

        return ResponseEntity.ok(response);
    }

    // POST: Add a favorite
    @PostMapping
    public ResponseEntity<Favorite> addFavorite(@RequestBody Favorite request) {
        String customerId = request.getCustomerId();
        if (customerId == null || customerId.trim().isEmpty()) {
            customerId = resolveCustomerId(null);
        }
        Favorite saved = favoriteService.addFavorite(
            customerId,
            request.getTargetType(),
            request.getTargetId()
        );
        return ResponseEntity.ok(saved);
    }

    // DELETE: Remove a favorite by customerId, targetType, targetId
    @DeleteMapping("/{customerId}/{targetType}/{targetId}")
    public ResponseEntity<Void> removeFavorite(
        @PathVariable String customerId,
        @PathVariable String targetType,
        @PathVariable String targetId) {
        String effectiveCustomerId = resolveCustomerId(customerId);
        favoriteService.removeFavorite(effectiveCustomerId, targetType, targetId);
        return ResponseEntity.noContent().build();
    }

    // DELETE: Remove a favorite for current active customer
    @DeleteMapping("/{targetType}/{targetId}")
    public ResponseEntity<Void> removeActiveFavorite(
        @PathVariable String targetType,
        @PathVariable String targetId) {
        String customerId = resolveCustomerId(null);
        favoriteService.removeFavorite(customerId, targetType, targetId);
        return ResponseEntity.noContent().build();
    }
}
