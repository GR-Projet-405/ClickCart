package com.clickcart.service;

import java.time.Instant;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.clickcart.dto.ServiceListingRequest;
import com.clickcart.dto.ServiceListingResponse;
import com.clickcart.model.ServiceListing;
import com.clickcart.model.ServiceListingStatus;
import com.clickcart.repository.ServiceListingRepository;

@Service
public class ServiceListingService {

    private final ServiceListingRepository repository;

    public ServiceListingService(ServiceListingRepository repository) {
        this.repository = repository;
    }

    public List<ServiceListingResponse> findForProvider(String providerId) {
        return repository.findAllByProviderIdOrderByUpdatedAtDesc(providerId)
            .stream().map(this::toResponse).toList();
    }

    public List<ServiceListingResponse> findActiveForMarketplace() {
        return repository.findAllByStatusOrderByUpdatedAtDesc(ServiceListingStatus.ACTIVE)
            .stream().map(this::toResponse).toList();
    }

    public ServiceListingResponse create(String providerId, ServiceListingRequest request) {
        ServiceListingStatus status = request.status() == null
            ? ServiceListingStatus.DRAFT : request.status();
        Instant now = Instant.now();
        ServiceListing listing = new ServiceListing();
        listing.setProviderId(providerId);
        apply(listing, request);
        listing.setStatus(status);
        listing.setCreatedAt(now);
        listing.setUpdatedAt(now);
        return toResponse(repository.save(listing));
    }

    public ServiceListingResponse update(String providerId, String id, ServiceListingRequest request) {
        ServiceListing listing = findOwned(providerId, id);
        apply(listing, request);
        listing.setUpdatedAt(Instant.now());
        return toResponse(repository.save(listing));
    }

    public ServiceListingResponse updateStatus(
        String providerId, String id, ServiceListingStatus status
    ) {
        ServiceListing listing = findOwned(providerId, id);
        listing.setStatus(status);
        listing.setUpdatedAt(Instant.now());
        return toResponse(repository.save(listing));
    }

    private ServiceListing findOwned(String providerId, String id) {
        return repository.findByIdAndProviderId(id, providerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Service not found"));
    }

    private void apply(ServiceListing listing, ServiceListingRequest request) {
        listing.setTitle(request.title().trim());
        listing.setCategory(request.category().trim());
        listing.setDescription(request.description().trim());
        listing.setPriceFrom(request.priceFrom());
        listing.setPriceTo(request.priceTo());
        listing.setPriceUnit(request.priceUnit() == null || request.priceUnit().isBlank()
            ? null : request.priceUnit().trim());
        listing.setImageUrl(request.imageUrl() == null || request.imageUrl().isBlank()
            ? null : request.imageUrl().trim());
    }

    private ServiceListingResponse toResponse(ServiceListing listing) {
        return new ServiceListingResponse(
            listing.getId(), listing.getTitle(), listing.getCategory(), listing.getDescription(),
            listing.getPriceFrom(), listing.getPriceTo(), listing.getPriceUnit(), listing.getImageUrl(),
            listing.getStatus(), listing.getCreatedAt(), listing.getUpdatedAt()
        );
    }
}
