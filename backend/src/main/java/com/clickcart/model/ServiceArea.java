package com.clickcart.model;

import java.time.Instant;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "service_areas")
@CompoundIndexes({
    @CompoundIndex(name = "provider_archived_idx", def = "{'providerId': 1, 'archived': 1}"),
    @CompoundIndex(name = "provider_city_district_idx", def = "{'providerId': 1, 'district': 1, 'cityName': 1, 'archived': 1}"),
    @CompoundIndex(name = "discovery_idx", def = "{'district': 1, 'cityName': 1, 'status': 1, 'archived': 1}")
})
public class ServiceArea {

    @Id
    private String id;

    @Indexed
    private String providerId;

    private String district;

    private String cityName;

    private String postalCode;

    private Double radiusKm;

    private Double latitude;

    private Double longitude;

    private String locationName;

    private ServiceAreaStatus status = ServiceAreaStatus.ACTIVE;

    private Boolean active = true;

    private Boolean archived = false;

    private Instant archivedAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public ServiceArea() {
    }

    public ServiceArea(String providerId, String district, String cityName, String postalCode, Double radiusKm) {
        this.providerId = providerId;
        this.district = district;
        this.cityName = cityName;
        this.postalCode = postalCode;
        this.radiusKm = radiusKm;
        this.status = ServiceAreaStatus.ACTIVE;
        this.active = true;
        this.archived = false;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
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
        this.active = status == ServiceAreaStatus.ACTIVE;
    }

    public Boolean getActive() {
        return active != null ? active : (status == ServiceAreaStatus.ACTIVE);
    }

    public void setActive(Boolean active) {
        this.active = active;
        this.status = Boolean.TRUE.equals(active) ? ServiceAreaStatus.ACTIVE : ServiceAreaStatus.INACTIVE;
    }

    public Boolean getArchived() {
        return archived;
    }

    public void setArchived(Boolean archived) {
        this.archived = archived;
    }

    public Instant getArchivedAt() {
        return archivedAt;
    }

    public void setArchivedAt(Instant archivedAt) {
        this.archivedAt = archivedAt;
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
