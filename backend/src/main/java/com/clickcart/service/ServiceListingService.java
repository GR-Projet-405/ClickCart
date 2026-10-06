package com.clickcart.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.clickcart.dto.PagedResponse;
import com.clickcart.dto.ServiceListingRequest;
import com.clickcart.dto.ServiceListingResponse;
import com.clickcart.model.ServiceListing;
import com.clickcart.model.ServiceListingStatus;
import com.clickcart.repository.ServiceListingRepository;
import com.clickcart.repository.ServicePackageRepository;
import com.clickcart.repository.ServicePricingRepository;

@Service
public class ServiceListingService {

    private final ServiceListingRepository repository;
    private final MongoTemplate mongoTemplate;
    private final ServicePackageRepository packageRepository;
    private final ServicePricingRepository pricingRepository;

    public ServiceListingService(ServiceListingRepository repository, MongoTemplate mongoTemplate,
            ServicePackageRepository packageRepository, ServicePricingRepository pricingRepository) {
        this.repository = repository;
        this.mongoTemplate = mongoTemplate;
        this.packageRepository = packageRepository;
        this.pricingRepository = pricingRepository;
    }

    public List<ServiceListingResponse> findForProvider(String providerId) {
        return repository.findAllByProviderIdOrderByUpdatedAtDesc(providerId)
                .stream().map(this::toResponse).toList();
    }

    public PagedResponse<ServiceListingResponse> searchMarketplace(
            String category,
            String location,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minRating,
            String availability,
            String sortBy,
            String q,
            Integer page,
            Integer size) {
        int pageNum = page == null ? 0 : Math.max(page, 0);
        int pageSize = size == null ? 10 : Math.max(Math.min(size, 100), 1);

        Query query = new Query();
        query.addCriteria(Criteria.where("status").is(ServiceListingStatus.ACTIVE));

        if (StringUtils.hasText(category)) {
            query.addCriteria(Criteria.where("category").regex(Pattern.quote(category.trim()), "i"));
        }
        if (StringUtils.hasText(location)) {
            query.addCriteria(Criteria.where("location").regex(Pattern.quote(location.trim()), "i"));
        }
        if (minPrice != null) {
            query.addCriteria(Criteria.where("priceFrom").gte(minPrice)
                    .orOperator(Criteria.where("priceTo").gte(minPrice), Criteria.where("priceFrom").exists(true)));
        }
        if (maxPrice != null) {
            query.addCriteria(Criteria.where("priceTo").lte(maxPrice)
                    .orOperator(Criteria.where("priceFrom").lte(maxPrice), Criteria.where("priceTo").exists(true)));
        }
        if (minRating != null) {
            query.addCriteria(Criteria.where("rating").gte(minRating.doubleValue()));
        }
        if (StringUtils.hasText(q)) {
            String regex = Pattern.quote(q.trim());
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("title").regex(regex, "i"),
                    Criteria.where("description").regex(regex, "i"),
                    Criteria.where("category").regex(regex, "i")));
        }
        if (StringUtils.hasText(availability)) {
            List<String> normalizedValues = Arrays.stream(availability.split(","))
                    .map(String::trim)
                    .filter(value -> !value.isEmpty())
                    .toList();
            if (!normalizedValues.isEmpty()) {
                validateAvailability(normalizedValues);
                query.addCriteria(Criteria.where("availability").in(normalizedValues));
            }
        }

        long totalElements = mongoTemplate.count(query, ServiceListing.class);

        Sort sort = resolveSort(sortBy);
        query.with(PageRequest.of(pageNum, pageSize, sort));

        List<ServiceListing> listings = mongoTemplate.find(query, ServiceListing.class);
        List<ServiceListingResponse> content = listings.stream().map(this::toResponse).toList();

        int totalPages = pageSize > 0 ? (int) Math.ceil((double) totalElements / pageSize) : 0;
        boolean last = totalPages == 0 || pageNum >= totalPages - 1;

        return new PagedResponse<>(content, pageNum, pageSize, totalElements, totalPages, last);
    }

    public List<ServiceListingResponse> findActiveForMarketplace() {
        return repository.findAllByStatusOrderByUpdatedAtDesc(ServiceListingStatus.ACTIVE)
                .stream().map(this::toResponse).toList();
    }

    public ServiceListingResponse create(String providerId, ServiceListingRequest request) {
        ServiceListingStatus status = request.status() == null
                ? ServiceListingStatus.DRAFT
                : request.status();
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
            String providerId, String id, ServiceListingStatus status) {
        ServiceListing listing = findOwned(providerId, id);
        listing.setStatus(status);
        listing.setUpdatedAt(Instant.now());
        return toResponse(repository.save(listing));
    }

    public void delete(String providerId, String id) {
        findOwned(providerId, id);
        packageRepository.deleteByServiceId(id);
        pricingRepository.deleteByServiceId(id);
        repository.deleteById(id);
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
                ? null
                : request.priceUnit().trim());
        listing.setImageUrl(request.imageUrl() == null || request.imageUrl().isBlank()
                ? null
                : request.imageUrl().trim());
    }

    private Sort resolveSort(String sortBy) {
        String normalizedSortBy = sortBy == null ? "relevance" : sortBy.trim().toLowerCase();
        return switch (normalizedSortBy) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "priceFrom");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "priceFrom");
            case "rating" -> Sort.by(Sort.Direction.DESC, "rating");
            case "relevance", "" -> Sort.by(Sort.Direction.DESC, "updatedAt");
            default -> throw new IllegalArgumentException(
                    "sortBy must be one of: relevance, price_asc, price_desc, rating");
        };
    }

    private void validateAvailability(List<String> values) {
        List<String> allowed = new ArrayList<>(List.of("today_tomorrow", "within_3_days"));
        for (String value : values) {
            if (!allowed.contains(value)) {
                throw new IllegalArgumentException(
                        "availability must be one of: today_tomorrow, within_3_days");
            }
        }
    }

    private ServiceListingResponse toResponse(ServiceListing listing) {
        return new ServiceListingResponse(
                listing.getId(), listing.getTitle(), listing.getCategory(), listing.getDescription(),
                listing.getPriceFrom(), listing.getPriceTo(), listing.getPriceUnit(), listing.getImageUrl(),
                listing.getStatus(), listing.getCreatedAt(), listing.getUpdatedAt());
    }

    // Methods for Map & Location Discovery
    public List<ServiceListing> getAllServiceListings() {
        return repository.findAll();
    }

    public List<ServiceListing> getActiveServiceListings() {
        // Find using enum instead of string
        return repository.findAllByStatusOrderByUpdatedAtDesc(ServiceListingStatus.ACTIVE);
    }

    public List<ServiceListing> getServiceListingsByCategory(String category) {
        return repository.findByCategory(category);
    }

    public Optional<ServiceListing> getServiceListingById(String id) {
        return repository.findById(id);
    }
}
