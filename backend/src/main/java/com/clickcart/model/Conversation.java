package com.clickcart.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Document(collection = "conversations")
@CompoundIndexes({
        @CompoundIndex(name = "idx_customer_lastmsg", def = "{ 'customerId': 1, 'lastMessageAt': -1 }"),
        @CompoundIndex(name = "idx_provider_lastmsg", def = "{ 'providerId': 1, 'lastMessageAt': -1 }"),
        @CompoundIndex(name = "idx_customer_provider_unique", def = "{ 'customerId': 1, 'providerId': 1 }", unique = true)
})
public class Conversation {

    @Id
    private String id;

    @Indexed
    @Field("bookingId")
    private String bookingId;

    @Indexed
    @Field("customerId")
    private String customerId;

    @Indexed
    @Field("providerId")
    private String providerId;

    @Field("serviceId")
    private String serviceId;

    private String serviceName;
    private String serviceCategory;

    private String customerName;
    private String customerAvatarFallback;
    private String providerName;
    private String providerAvatarFallback;

    private String bookingStatus;

    @Field("lastMessageText")
    private String lastMessageText;

    @Field("lastMessageAt")
    private Instant lastMessageAt;

    @Field("customerUnread")
    private int customerUnread;

    @Field("providerUnread")
    private int providerUnread;

    @CreatedDate
    @Field("createdAt")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updatedAt")
    private Instant updatedAt;

    public Conversation() {
    }

    public Conversation(String customerId, String providerId) {
        this.customerId = customerId;
        this.providerId = providerId;
    }

    // Getters and Setters
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

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public String getServiceCategory() {
        return serviceCategory;
    }

    public void setServiceCategory(String serviceCategory) {
        this.serviceCategory = serviceCategory;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerAvatarFallback() {
        return customerAvatarFallback;
    }

    public void setCustomerAvatarFallback(String customerAvatarFallback) {
        this.customerAvatarFallback = customerAvatarFallback;
    }

    public String getProviderName() {
        return providerName;
    }

    public void setProviderName(String providerName) {
        this.providerName = providerName;
    }

    public String getProviderAvatarFallback() {
        return providerAvatarFallback;
    }

    public void setProviderAvatarFallback(String providerAvatarFallback) {
        this.providerAvatarFallback = providerAvatarFallback;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    // Text & Preview Aliases (Supports both old & new)
    public String getLastMessageText() {
        return lastMessageText;
    }

    public void setLastMessageText(String lastMessageText) {
        this.lastMessageText = lastMessageText;
    }

    public String getLastMessagePreview() {
        return lastMessageText;
    }

    public void setLastMessagePreview(String lastMessagePreview) {
        this.lastMessageText = lastMessagePreview;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    // Unread Counters Aliases (Supports both old & new)
    public int getCustomerUnread() {
        return customerUnread;
    }

    public void setCustomerUnread(int customerUnread) {
        this.customerUnread = customerUnread;
    }

    public int getUnreadByCustomer() {
        return customerUnread;
    }

    public void setUnreadByCustomer(int unreadByCustomer) {
        this.customerUnread = unreadByCustomer;
    }

    public int getProviderUnread() {
        return providerUnread;
    }

    public void setProviderUnread(int providerUnread) {
        this.providerUnread = providerUnread;
    }

    public int getUnreadByProvider() {
        return providerUnread;
    }

    public void setUnreadByProvider(int unreadByProvider) {
        this.providerUnread = unreadByProvider;
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