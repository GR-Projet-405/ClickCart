package com.clickcart.dto;

import java.time.Instant;
import com.clickcart.model.ServiceArea;
import com.clickcart.model.ServiceAreaStatus;

public class ServiceAreaResponse {

    private String id;
    private String providerId;
    private String district;
    private String cityName;
    private String postalCode;
    private Double radiusKm;
    private Double latitude;
    private Double longitude;
    private String locationName;
    private ServiceAreaStatus status;
    private Boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public ServiceAreaResponse() {
    }

    public static ServiceAreaResponse fromEntity(ServiceArea entity) {
        if (entity == null) {
            return null;
        }
        ServiceAreaResponse dto = new ServiceAreaResponse();
        dto.setId(entity.getId());
        dto.setProviderId(entity.getProviderId());
        dto.setDistrict(entity.getDistrict());
        dto.setCityName(entity.getCityName());
        dto.setPostalCode(entity.getPostalCode());
        dto.setRadiusKm(entity.getRadiusKm());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setLocationName(entity.getLocationName());
        dto.setStatus(entity.getStatus());
        dto.setActive(entity.getActive());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public Double getRadiusKm() {
        return radiusKm;
    }

    public void setRadiusKm(Double radiusKm) {
        this.radiusKm = radiusKm;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public ServiceAreaStatus getStatus() {
        return status;
    }

    public void setStatus(ServiceAreaStatus status) {
        this.status = status;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
