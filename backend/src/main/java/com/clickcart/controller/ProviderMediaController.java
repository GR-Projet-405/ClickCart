package com.clickcart.controller;

import com.clickcart.model.ServiceListing;
import com.clickcart.repository.ServiceListingRepository;
import com.clickcart.security.CurrentProvider;
import com.clickcart.service.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.io.IOException;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/provider/services/{serviceId}/media")
public class ProviderMediaController {
    private final ServiceListingRepository listings;
    private final CloudinaryService uploads;
    public ProviderMediaController(ServiceListingRepository listings, CloudinaryService uploads) {
        this.listings = listings;
        this.uploads = uploads;
    }
    private ServiceListing own(String serviceId) {
        return listings.findByIdAndProviderId(serviceId, CurrentProvider.id())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found in your account"));
    }
    @GetMapping
    public List<ServiceListing.MediaItem> list(@PathVariable String serviceId) {
        return own(serviceId).getMedia();
    }
    @PostMapping
    public List<ServiceListing.MediaItem> upload(@PathVariable String serviceId, @RequestParam("file") MultipartFile file) throws IOException {
        ServiceListing listing = own(serviceId);
        String contentType = file.getContentType();
        if (file.isEmpty() || file.getSize() > 10 * 1024 * 1024
                || !Set.of("image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm").contains(contentType == null ? "" : contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a JPG, PNG, WebP, MP4 or WebM file up to 10 MB");
        }
        if (listing.getMedia().size() >= 20) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A service can have up to 20 media files");
        String url = uploads.uploadMedia(file);
        boolean image = contentType.startsWith("image/");
        boolean cover = image && (listing.getImageUrl() == null || listing.getImageUrl().isBlank());
        listing.getMedia().add(new ServiceListing.MediaItem(UUID.randomUUID().toString(), image ? "image" : "video", url, cover, ""));
        if (cover) listing.setImageUrl(url);
        return save(listing);
    }
    public record MediaUpdate(String label, boolean isCover) {}
    @PatchMapping("/{mediaId}")
    public List<ServiceListing.MediaItem> update(@PathVariable String serviceId, @PathVariable String mediaId, @RequestBody MediaUpdate request) {
        ServiceListing listing = own(serviceId);
        ServiceListing.MediaItem selected = listing.getMedia().stream().filter(m -> m.id().equals(mediaId)).findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));
        if (request.isCover() && !"image".equals(selected.type())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose an image for the cover");
        if (request.label() != null && request.label().length() > 200) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Caption must be at most 200 characters");
        listing.setMedia(listing.getMedia().stream().map(m -> new ServiceListing.MediaItem(m.id(), m.type(), m.url(),
            request.isCover() ? m.id().equals(mediaId) : m.isCover(), m.id().equals(mediaId) && request.label() != null ? request.label().trim() : m.label())).toList());
        if (request.isCover()) listing.setImageUrl(selected.url());
        return save(listing);
    }
    @DeleteMapping("/{mediaId}")
    public List<ServiceListing.MediaItem> delete(@PathVariable String serviceId, @PathVariable String mediaId) {
        ServiceListing listing = own(serviceId);
        ServiceListing.MediaItem selected = listing.getMedia().stream().filter(m -> m.id().equals(mediaId)).findFirst()
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found"));
        listing.getMedia().removeIf(m -> m.id().equals(mediaId));
        if (Objects.equals(listing.getImageUrl(), selected.url())) listing.setImageUrl(null);
        return save(listing);
    }
    private List<ServiceListing.MediaItem> save(ServiceListing listing) {
        listing.setUpdatedAt(Instant.now());
        return listings.save(listing).getMedia();
    }
}
