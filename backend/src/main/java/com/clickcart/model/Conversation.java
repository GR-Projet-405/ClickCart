package com.clickcart.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * A booking-linked conversation between a customer and a service provider.
 * One conversation is created per booking.
 */
@Document(collection = "conversations")
public class Conversation {

    @Id
    private String id;

    /** The booking this conversation belongs to. */
    @Indexed
    private String bookingId;

    /** Customer's user ID. */
    @Indexed
    private String customerId;

    /** Service provider's user ID. */
    @Indexed
    private String providerId;

    /** Optional: the service being booked (for display purposes). */
    private String serviceId;
    private String serviceName;
    private String serviceCategory;

    // Denormalised display fields (kept in sync by the service layer)
    private String customerName;
    private String customerAvatarFallback;
    private String providerName;
    private String providerAvatarFallback;

    /** Booking status, copied from booking (e.g. "Confirmed", "In Progress"). */
    private String bookingStatus;

    /** Snippet of the last message for the conversation list. */
    private String lastMessagePreview;
    private Instant lastMessageAt;

    /** Unread counts per role so each side can see their own badge. */
    private int unreadByCustomer;
    private int unreadByProvider;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public Conversation() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }

    public String getProviderId() { return providerId; }
    public void setProviderId(String providerId) { this.providerId = providerId; }

    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getServiceCategory() { return serviceCategory; }
    public void setServiceCategory(String serviceCategory) { this.serviceCategory = serviceCategory; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerAvatarFallback() { return customerAvatarFallback; }
    public void setCustomerAvatarFallback(String customerAvatarFallback) { this.customerAvatarFallback = customerAvatarFallback; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getProviderAvatarFallback() { return providerAvatarFallback; }
    public void setProviderAvatarFallback(String providerAvatarFallback) { this.providerAvatarFallback = providerAvatarFallback; }

    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }

    public String getLastMessagePreview() { return lastMessagePreview; }
    public void setLastMessagePreview(String lastMessagePreview) { this.lastMessagePreview = lastMessagePreview; }

    public Instant getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(Instant lastMessageAt) { this.lastMessageAt = lastMessageAt; }

    public int getUnreadByCustomer() { return unreadByCustomer; }
    public void setUnreadByCustomer(int unreadByCustomer) { this.unreadByCustomer = unreadByCustomer; }

    public int getUnreadByProvider() { return unreadByProvider; }
    public void setUnreadByProvider(int unreadByProvider) { this.unreadByProvider = unreadByProvider; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
