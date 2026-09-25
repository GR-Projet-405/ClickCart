package com.clickcart.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "provider_jobs")
@CompoundIndex(name = "provider_status_idx", def = "{'providerId': 1, 'status': 1}")
public class ProviderJob {

    @Id
    private String id;
    private String publicCode;
    private String bookingCode;
    private String providerId;
    private JobStatus status;
    private String serviceTitle;
    private String serviceCategory;
    private String packageName;
    private String slaLabel;

    private String customerId;
    private String customerName;
    private String customerPhone;
    private String customerAvatarUrl;
    private Double customerRating;
    private Integer customerPreviousBookings;
    private boolean customerVerified;
    private String customerMemberArea;

    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private String mapAreaLabel;
    private Double distanceKm;
    private Integer etaMinutes;
    private String transitNote;
    private String accessInstructions;

    private Instant placedAt;
    private Instant acceptedAt;
    private Instant startedAt;
    private Instant completedAt;
    private Instant scheduledStart;
    private Instant scheduledEnd;

    private String paymentHold;
    private Double serviceBaseFee;
    private Double partsTopUp;
    private Double platformCommission;
    private Double netPayout;
    private Double fuelAllowance;

    private String progressLabel;
    private Integer progressPercent;
    private String completionNotes;

    private List<JobDiagnostic> diagnostics = new ArrayList<>();
    private List<JobPhoto> photos = new ArrayList<>();
    private List<String> checklist = new ArrayList<>();

    private Instant createdAt;
    private Instant updatedAt;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPublicCode() {
        return publicCode;
    }

    public void setPublicCode(String publicCode) {
        this.publicCode = publicCode;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public void setBookingCode(String bookingCode) {
        this.bookingCode = bookingCode;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public JobStatus getStatus() {
        return status;
    }

    public void setStatus(JobStatus status) {
        this.status = status;
    }

    public String getServiceTitle() {
        return serviceTitle;
    }

    public void setServiceTitle(String serviceTitle) {
        this.serviceTitle = serviceTitle;
    }

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public String getPackageName() {
        return packageName;
    }

    public void setPackageName(String packageName) {
        this.packageName = packageName;
    }

    public String getSlaLabel() {
        return slaLabel;
    }

    public void setSlaLabel(String slaLabel) {
        this.slaLabel = slaLabel;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public String getCustomerAvatarUrl() {
        return customerAvatarUrl;
    }

    public void setCustomerAvatarUrl(String customerAvatarUrl) {
        this.customerAvatarUrl = customerAvatarUrl;
    }

    public Double getCustomerRating() {
        return customerRating;
    }

    public void setCustomerRating(Double customerRating) {
        this.customerRating = customerRating;
    }

    public Integer getCustomerPreviousBookings() {
        return customerPreviousBookings;
    }

    public void setCustomerPreviousBookings(Integer customerPreviousBookings) {
        this.customerPreviousBookings = customerPreviousBookings;
    }

    public boolean isCustomerVerified() {
        return customerVerified;
    }

    public void setCustomerVerified(boolean customerVerified) {
        this.customerVerified = customerVerified;
    }

    public String getCustomerMemberArea() {
        return customerMemberArea;
    }

    public void setCustomerMemberArea(String customerMemberArea) {
        this.customerMemberArea = customerMemberArea;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
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

    public String getMapAreaLabel() {
        return mapAreaLabel;
    }

    public void setMapAreaLabel(String mapAreaLabel) {
        this.mapAreaLabel = mapAreaLabel;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getEtaMinutes() {
        return etaMinutes;
    }

    public void setEtaMinutes(Integer etaMinutes) {
        this.etaMinutes = etaMinutes;
    }

    public String getTransitNote() {
        return transitNote;
    }

    public void setTransitNote(String transitNote) {
        this.transitNote = transitNote;
    }

    public String getAccessInstructions() {
        return accessInstructions;
    }

    public void setAccessInstructions(String accessInstructions) {
        this.accessInstructions = accessInstructions;
    }

    public Instant getPlacedAt() {
        return placedAt;
    }

    public void setPlacedAt(Instant placedAt) {
        this.placedAt = placedAt;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public void setAcceptedAt(Instant acceptedAt) {
        this.acceptedAt = acceptedAt;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public Instant getScheduledStart() {
        return scheduledStart;
    }

    public void setScheduledStart(Instant scheduledStart) {
        this.scheduledStart = scheduledStart;
    }

    public Instant getScheduledEnd() {
        return scheduledEnd;
    }

    public void setScheduledEnd(Instant scheduledEnd) {
        this.scheduledEnd = scheduledEnd;
    }

    public String getPaymentHold() {
        return paymentHold;
    }

    public void setPaymentHold(String paymentHold) {
        this.paymentHold = paymentHold;
    }

    public Double getServiceBaseFee() {
        return serviceBaseFee;
    }

    public void setServiceBaseFee(Double serviceBaseFee) {
        this.serviceBaseFee = serviceBaseFee;
    }

    public Double getPartsTopUp() {
        return partsTopUp;
    }

    public void setPartsTopUp(Double partsTopUp) {
        this.partsTopUp = partsTopUp;
    }

    public Double getPlatformCommission() {
        return platformCommission;
    }

    public void setPlatformCommission(Double platformCommission) {
        this.platformCommission = platformCommission;
    }

    public Double getNetPayout() {
        return netPayout;
    }

    public void setNetPayout(Double netPayout) {
        this.netPayout = netPayout;
    }

    public Double getFuelAllowance() {
        return fuelAllowance;
    }

    public void setFuelAllowance(Double fuelAllowance) {
        this.fuelAllowance = fuelAllowance;
    }

    public String getProgressLabel() {
        return progressLabel;
    }

    public void setProgressLabel(String progressLabel) {
        this.progressLabel = progressLabel;
    }

    public Integer getProgressPercent() {
        return progressPercent;
    }

    public void setProgressPercent(Integer progressPercent) {
        this.progressPercent = progressPercent;
    }

    public String getCompletionNotes() {
        return completionNotes;
    }

    public void setCompletionNotes(String completionNotes) {
        this.completionNotes = completionNotes;
    }

    public List<JobDiagnostic> getDiagnostics() {
        return diagnostics;
    }

    public void setDiagnostics(List<JobDiagnostic> diagnostics) {
        this.diagnostics = diagnostics;
    }

    public List<JobPhoto> getPhotos() {
        return photos;
    }

    public void setPhotos(List<JobPhoto> photos) {
        this.photos = photos;
    }

    public List<String> getChecklist() {
        return checklist;
    }

    public void setChecklist(List<String> checklist) {
        this.checklist = checklist;
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
