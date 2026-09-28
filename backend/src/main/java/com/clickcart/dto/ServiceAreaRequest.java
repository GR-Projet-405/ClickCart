package com.clickcart.dto;

import com.clickcart.model.ServiceAreaStatus;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ServiceAreaRequest {

    @NotBlank(message = "District is required")
    @Size(max = 100, message = "District name cannot exceed 100 characters")
    private String district;

    @NotBlank(message = "City Name is required")
    @Size(min = 2, max = 100, message = "City Name must be between 2 and 100 characters")
    private String cityName;

    @Pattern(regexp = "^$|^[0-9A-Za-z -]{3,10}$", message = "Postal code must be between 3 and 10 characters")
    private String postalCode;

    @NotNull(message = "Coverage Radius is required")
    @DecimalMin(value = "1.0", message = "Coverage Radius must be at least 1 km")
    @DecimalMax(value = "200.0", message = "Coverage Radius cannot exceed 200 km")
    private Double radiusKm;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    private String locationName;

    private ServiceAreaStatus status = ServiceAreaStatus.ACTIVE;

    private Boolean active;

    public ServiceAreaRequest() {
    }

    public ServiceAreaRequest(String district, String cityName, String postalCode, Double radiusKm) {
        this.district = district;
        this.cityName = cityName;
        this.postalCode = postalCode;
        this.radiusKm = radiusKm;
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
        return active != null ? active : (status == ServiceAreaStatus.ACTIVE);
    }

    public void setActive(Boolean active) {
        this.active = active;
        if (active != null) {
            this.status = active ? ServiceAreaStatus.ACTIVE : ServiceAreaStatus.INACTIVE;
        }
    }
}
