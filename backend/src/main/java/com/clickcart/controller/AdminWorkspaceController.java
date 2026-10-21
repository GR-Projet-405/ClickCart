package com.clickcart.controller;

import com.clickcart.dto.auth.AuthenticatedUser;
import com.clickcart.model.*;
import com.clickcart.service.AccountStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.io.ByteArrayInputStream;
import javax.imageio.ImageIO;

@RestController
@RequestMapping("/api/admin/workspace")
public class AdminWorkspaceController {
    private final AccountStore users;
    private final MongoTemplate mongo;
    public AdminWorkspaceController(AccountStore users, MongoTemplate mongo) { this.users = users; this.mongo = mongo; }
    private User current() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof AuthenticatedUser principal)) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        if (principal.role() != Role.PLATFORM_ADMIN) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        var user = users.findById(principal.id()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (user.getRole() != Role.PLATFORM_ADMIN || user.getStatus() != AccountStatus.ACTIVE) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return user;
    }
    public record Profile(String id, String fullName, String email, String phone, String avatar) {}
    private Profile profile(User u) { return new Profile(u.getId(), u.getFullName(), u.getEmail(), u.getPhone(), u.getAvatar()); }
    @GetMapping("/profile") public Profile profile() { return profile(current()); }
    public record Edit(@NotBlank @Size(max=100) String fullName, @Pattern(regexp="^$|^\\+?[0-9 ()-]{7,20}$") String phone, @Size(max=700000) String avatar) {}
    @PutMapping("/profile") public Profile save(@Valid @RequestBody Edit edit) {
        var user = current();
        validateAvatar(edit.avatar());
        // Update profile fields only, preserving concurrent password/session changes.
        mongo.updateFirst(Query.query(Criteria.where("_id").is(user.getId())), new Update().set("fullName", edit.fullName().trim()).set("phone", edit.phone()).set("avatar", edit.avatar()).set("updatedAt", Instant.now()), User.class, AccountStore.ADMINS);
        return profile(users.findById(user.getId()).orElseThrow());
    }
    static void validateAvatar(String avatar) {
        if (avatar == null || avatar.isBlank()) return;
        try {
            if (!avatar.startsWith("data:image/png;base64,") && !avatar.startsWith("data:image/jpeg;base64,")) throw new IllegalArgumentException();
            byte[] bytes = Base64.getDecoder().decode(avatar.substring(avatar.indexOf(',') + 1));
            if (bytes.length > 512000) throw new IllegalArgumentException();
            try (var input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
                var readers = ImageIO.getImageReaders(input);
                if (!readers.hasNext()) throw new IllegalArgumentException();
                var reader = readers.next();
                try {
                    reader.setInput(input);
                    if (reader.getWidth(0) > 2048 || reader.getHeight(0) > 2048) throw new IllegalArgumentException();
                    reader.read(0);
                } finally { reader.dispose(); }
            }
        } catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid PNG/JPEG under 500 KB and 2048 pixels per side."); }
    }
    @GetMapping("/summary") public Map<String, Long> summary() {
        current();
        return Map.of("users", mongo.count(new Query(), "users"), "providers", mongo.count(Query.query(Criteria.where("role").is("SERVICE_PROVIDER")), "users"), "bookings", mongo.count(new Query(), "bookings"), "payments", mongo.count(new Query(), "payments"));
    }
    @GetMapping("/records/{type}") public Map<String, Object> records(@PathVariable String type, @RequestParam(defaultValue="0") int page) {
        current();
        String[] fields = switch (type) {
            case "users" -> new String[]{"fullName", "email", "role", "status", "createdAt"};
            case "bookings" -> new String[]{"serviceTitle", "customerName", "providerName", "status", "bookingDate", "createdAt"};
            case "payments" -> new String[]{"serviceTitle", "customerName", "amount", "currency", "status", "paymentMethod", "createdAt"};
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        };
        if (page < 0 || page > 100000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        var query = new Query().with(Sort.by(Sort.Direction.DESC, "createdAt", "_id")).skip((long)page * 25).limit(25);
        query.fields().include(fields);
        var rows = mongo.find(query, Document.class, type).stream().map(doc -> {
            Map<String,Object> row = new LinkedHashMap<>(); row.put("id", String.valueOf(doc.get("_id")));
            for (String field : fields) row.put(field, doc.get(field));
            return row;
        }).toList();
        return Map.of("rows", rows, "total", mongo.count(new Query(), type));
    }
}
