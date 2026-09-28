package com.clickcart.dto;

import java.time.Instant;
import java.util.List;

import com.clickcart.model.ModerationStatus;

public class ReviewResponse {

    private String id;
    private String bookingId;
    private String customerId;
    private String providerId;
    private String serviceId;

    private int rating;
    private String content;
    private List<String> photoUrls;

    private boolean verifiedBooking;

    private ModerationStatus moderationStatus;
    private List<String> moderationFlags;

    private String providerResponse;

    private int helpfulCount;
    private boolean reported;

    private Instant createdAt;
    private Instant updatedAt;

    public ReviewResponse() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getServiceId() {
        return serviceId;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public int getRating() {
        return rating;
    }

    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public List<String> getPhotoUrls() {
        return photoUrls;
    }

    public void setPhotoUrls(List<String> photoUrls) {
        this.photoUrls = photoUrls;
    }

    public boolean isVerifiedBooking() {
        return verifiedBooking;
    }

    public void setVerifiedBooking(boolean verifiedBooking) {
        this.verifiedBooking = verifiedBooking;
    }

    public ModerationStatus getModerationStatus() {
        return moderationStatus;
    }

    public void setModerationStatus(ModerationStatus moderationStatus) {
        this.moderationStatus = moderationStatus;
    }

    public List<String> getModerationFlags() {
        return moderationFlags;
    }

    public void setModerationFlags(List<String> moderationFlags) {
        this.moderationFlags = moderationFlags;
    }

    public String getProviderResponse() {
        return providerResponse;
    }

    public void setProviderResponse(String providerResponse) {
        this.providerResponse = providerResponse;
    }

    public int getHelpfulCount() {
        return helpfulCount;
    }

    public void setHelpfulCount(int helpfulCount) {
        this.helpfulCount = helpfulCount;
    }

    public boolean isReported() {
        return reported;
    }

    public void setReported(boolean reported) {
        this.reported = reported;
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