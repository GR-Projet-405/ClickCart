package com.clickcart.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import com.clickcart.dto.PagedResponse;
import com.clickcart.dto.ServiceAreaRequest;
import com.clickcart.dto.ServiceAreaResponse;
import com.clickcart.dto.ServiceAreaStatusRequest;
import com.clickcart.dto.ServiceAreaSummaryResponse;
import com.clickcart.exception.DuplicateResourceException;
import com.clickcart.exception.ForbiddenException;
import com.clickcart.exception.InvalidLocationException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.ServiceArea;
import com.clickcart.model.ServiceAreaStatus;
import com.clickcart.repository.ServiceAreaRepository;
import com.clickcart.service.LocationLookupService;
import com.clickcart.service.ServiceAreaService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class ServiceAreaServiceImpl implements ServiceAreaService {

    private final ServiceAreaRepository serviceAreaRepository;
    private final LocationLookupService locationLookupService;
    private final MongoTemplate mongoTemplate;

    public ServiceAreaServiceImpl(
            ServiceAreaRepository serviceAreaRepository,
            LocationLookupService locationLookupService,
            MongoTemplate mongoTemplate) {
        this.serviceAreaRepository = serviceAreaRepository;
        this.locationLookupService = locationLookupService;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public ServiceAreaResponse createServiceArea(String providerId, ServiceAreaRequest request) {
        validateProviderId(providerId);
        validateRequest(request);

        String trimmedDistrict = request.getDistrict().trim();
        String trimmedCity = request.getCityName().trim();

        if (serviceAreaRepository.existsByProviderIdAndDistrictIgnoreCaseAndCityNameIgnoreCaseAndArchivedFalse(
                providerId, trimmedDistrict, trimmedCity)) {
            throw new DuplicateResourceException(
                    "A service area for " + trimmedCity + ", " + trimmedDistrict + " already exists."
            );
        }

        ServiceArea serviceArea = new ServiceArea();
        serviceArea.setProviderId(providerId);
        serviceArea.setDistrict(trimmedDistrict);
        serviceArea.setCityName(trimmedCity);
        serviceArea.setPostalCode(StringUtils.hasText(request.getPostalCode()) ? request.getPostalCode().trim() : "");
        serviceArea.setRadiusKm(request.getRadiusKm());

        // Coordinate resolution and validation
        resolveAndSetCoordinates(serviceArea, request, trimmedCity, trimmedDistrict);

        ServiceAreaStatus status = request.getStatus() != null ? request.getStatus() : ServiceAreaStatus.ACTIVE;
        if (request.getActive() != null) {
            status = request.getActive() ? ServiceAreaStatus.ACTIVE : ServiceAreaStatus.INACTIVE;
        }
        serviceArea.setStatus(status);
        serviceArea.setActive(status == ServiceAreaStatus.ACTIVE);
        serviceArea.setArchived(false);
        serviceArea.setCreatedAt(Instant.now());
        serviceArea.setUpdatedAt(Instant.now());

        ServiceArea saved = serviceAreaRepository.save(serviceArea);
        return ServiceAreaResponse.fromEntity(saved);
    }

    @Override
    public PagedResponse<ServiceAreaResponse> getServiceAreas(
            String providerId, String search, String status, String district, int page, int size) {
        validateProviderId(providerId);

        int pageNum = Math.max(0, page);
        int pageSize = size > 0 ? Math.min(size, 100) : 8; // Default 8 matching screenshot pagination

        Query query = new Query();
        query.addCriteria(Criteria.where("providerId").is(providerId).and("archived").is(false));

        if (StringUtils.hasText(search)) {
            String regex = Pattern.quote(search.trim());
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("cityName").regex(regex, "i"),
                    Criteria.where("district").regex(regex, "i"),
                    Criteria.where("postalCode").regex(regex, "i")
            );
            query.addCriteria(searchCriteria);
        }

        if (StringUtils.hasText(status) && !"ALL".equalsIgnoreCase(status)) {
            try {
                ServiceAreaStatus statusEnum = ServiceAreaStatus.valueOf(status.trim().toUpperCase());
                query.addCriteria(Criteria.where("status").is(statusEnum));
            } catch (IllegalArgumentException e) {
                // Ignore or handle invalid status gracefully
            }
        }

        if (StringUtils.hasText(district)) {
            query.addCriteria(Criteria.where("district").regex(Pattern.quote(district.trim()), "i"));
        }

        long totalElements = mongoTemplate.count(query, ServiceArea.class);

        query.with(PageRequest.of(pageNum, pageSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<ServiceArea> areas = mongoTemplate.find(query, ServiceArea.class);

        List<ServiceAreaResponse> content = areas.stream()
                .map(ServiceAreaResponse::fromEntity)
                .collect(Collectors.toList());

        int totalPages = pageSize > 0 ? (int) Math.ceil((double) totalElements / pageSize) : 0;
        boolean last = pageNum >= totalPages - 1;

        return new PagedResponse<>(content, pageNum, pageSize, totalElements, totalPages, last);
    }

    @Override
    public ServiceAreaResponse getServiceAreaById(String providerId, String id) {
        validateProviderId(providerId);
        ServiceArea area = findAreaAndVerifyOwnership(providerId, id);
        return ServiceAreaResponse.fromEntity(area);
    }

    @Override
    public ServiceAreaResponse updateServiceArea(String providerId, String id, ServiceAreaRequest request) {
        validateProviderId(providerId);
        validateRequest(request);
        ServiceArea area = findAreaAndVerifyOwnership(providerId, id);

        String trimmedDistrict = request.getDistrict().trim();
        String trimmedCity = request.getCityName().trim();

        boolean cityChanged = !trimmedCity.equalsIgnoreCase(area.getCityName());
        boolean districtChanged = !trimmedDistrict.equalsIgnoreCase(area.getDistrict());

        if ((cityChanged || districtChanged) &&
                serviceAreaRepository.existsByProviderIdAndDistrictIgnoreCaseAndCityNameIgnoreCaseAndArchivedFalse(
                        providerId, trimmedDistrict, trimmedCity)) {
            throw new DuplicateResourceException(
                    "A service area for " + trimmedCity + ", " + trimmedDistrict + " already exists."
            );
        }

        area.setDistrict(trimmedDistrict);
        area.setCityName(trimmedCity);
        area.setPostalCode(StringUtils.hasText(request.getPostalCode()) ? request.getPostalCode().trim() : "");
        area.setRadiusKm(request.getRadiusKm());

        resolveAndSetCoordinates(area, request, trimmedCity, trimmedDistrict);

        if (request.getStatus() != null) {
            area.setStatus(request.getStatus());
        }
        if (request.getActive() != null) {
            area.setActive(request.getActive());
        }
        area.setUpdatedAt(Instant.now());

        ServiceArea updated = serviceAreaRepository.save(area);
        return ServiceAreaResponse.fromEntity(updated);
    }

    @Override
    public ServiceAreaResponse updateStatus(String providerId, String id, ServiceAreaStatusRequest statusRequest) {
        validateProviderId(providerId);
        ServiceArea area = findAreaAndVerifyOwnership(providerId, id);

        if (statusRequest != null && statusRequest.getStatus() != null) {
            area.setStatus(statusRequest.getStatus());
        } else if (statusRequest != null && statusRequest.getActive() != null) {
            area.setActive(statusRequest.getActive());
        }
        area.setUpdatedAt(Instant.now());

        ServiceArea updated = serviceAreaRepository.save(area);
        return ServiceAreaResponse.fromEntity(updated);
    }

    @Override
    public void archiveServiceArea(String providerId, String id) {
        validateProviderId(providerId);
        ServiceArea area = findAreaAndVerifyOwnership(providerId, id);

        area.setArchived(true);
        area.setArchivedAt(Instant.now());
        area.setUpdatedAt(Instant.now());
        serviceAreaRepository.save(area);
    }

    @Override
    public ServiceAreaSummaryResponse getSummary(String providerId) {
        validateProviderId(providerId);

        long totalCoverage = serviceAreaRepository.countByProviderIdAndArchivedFalse(providerId);
        long activeLocations = serviceAreaRepository.countByProviderIdAndStatusAndArchivedFalse(
                providerId, ServiceAreaStatus.ACTIVE);

        List<ServiceArea> areas = serviceAreaRepository.findByProviderIdAndArchivedFalse(providerId);
        double totalRadius = areas.stream()
                .filter(a -> Boolean.TRUE.equals(a.getActive()) || a.getStatus() == ServiceAreaStatus.ACTIVE)
                .mapToDouble(a -> a.getRadiusKm() != null ? a.getRadiusKm() : 0.0)
                .sum();

        return new ServiceAreaSummaryResponse(totalCoverage, activeLocations, Math.round(totalRadius * 10.0) / 10.0);
    }

    @Override
    public List<ServiceAreaResponse> findCoveringServiceAreas(String district, String cityName) {
        List<ServiceArea> matches = serviceAreaRepository.findActiveByDistrictAndCity(
                district != null ? district : "",
                cityName != null ? cityName : ""
        );
        return matches.stream()
                .map(ServiceAreaResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private ServiceArea findAreaAndVerifyOwnership(String providerId, String id) {
        ServiceArea area = serviceAreaRepository.findByIdAndArchivedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service area not found with id: " + id));

        if (!providerId.equals(area.getProviderId())) {
            throw new ForbiddenException("You do not have permission to access or modify this service area");
        }
        return area;
    }

    private void validateProviderId(String providerId) {
        if (!StringUtils.hasText(providerId)) {
            throw new ForbiddenException("Authenticated provider context is required");
        }
    }

    private void validateRequest(ServiceAreaRequest request) {
        if (request == null) {
            throw new InvalidLocationException("Request body cannot be null");
        }
        if (!StringUtils.hasText(request.getDistrict())) {
            throw new InvalidLocationException("District is required");
        }
        if (!StringUtils.hasText(request.getCityName())) {
            throw new InvalidLocationException("City Name is required");
        }
        if (request.getRadiusKm() == null || request.getRadiusKm() <= 0 || request.getRadiusKm() > 200) {
            throw new InvalidLocationException("Coverage radius must be between 1 and 200 km");
        }
        if (request.getLatitude() != null && (request.getLatitude() < -90.0 || request.getLatitude() > 90.0)) {
            throw new InvalidLocationException("Latitude must be between -90 and 90 degrees");
        }
        if (request.getLongitude() != null && (request.getLongitude() < -180.0 || request.getLongitude() > 180.0)) {
            throw new InvalidLocationException("Longitude must be between -180 and 180 degrees");
        }
    }

    private void resolveAndSetCoordinates(
            ServiceArea area, ServiceAreaRequest request, String cityName, String district) {
        if (request.getLatitude() != null && request.getLongitude() != null) {
            area.setLatitude(request.getLatitude());
            area.setLongitude(request.getLongitude());
        } else {
            LocationLookupService.LocationCoordinate resolved =
                    locationLookupService.resolveCoordinates(cityName, district);
            area.setLatitude(resolved.latitude());
            area.setLongitude(resolved.longitude());
            if (!StringUtils.hasText(area.getPostalCode()) && StringUtils.hasText(resolved.defaultPostalCode())) {
                area.setPostalCode(resolved.defaultPostalCode());
            }
        }
        area.setLocationName(cityName + ", " + district + ", Sri Lanka");
    }
}
