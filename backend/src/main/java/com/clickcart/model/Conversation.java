package com.clickcart.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * Represents a messaging thread between exactly one customer and one provider.
 *
 * <p>There is at most one {@code Conversation} per (customerId, providerId) pair,
 * enforced by the unique compound index. The conversation may optionally be
 * associated with a service listing or a booking for context.</p>
 *
 * <p>Unread counts are maintained as denormalised integers on the conversation
 * document so that a conversation list query returns unread badges without a
 * secondary aggregation over the messages collection.</p>
 *
 * <p>Collection: {@code conversations}</p>
 */
@Document(collection = "conversations")
@CompoundIndexes({
    // Customer's conversation list — sorted newest-first
    @CompoundIndex(name = "idx_customer_lastmsg",
                   def = "{ 'customerId': 1, 'lastMessageAt': -1 }"),
    // Provider's conversation list — sorted newest-first
    @CompoundIndex(name = "idx_provider_lastmsg",
                   def = "{ 'providerId': 1, 'lastMessageAt': -1 }"),
    // One conversation per customer-provider pair (unique, sparse)
    @CompoundIndex(name = "idx_customer_provider_unique",
                   def = "{ 'customerId': 1, 'providerId': 1 }",
                   unique = true)
})
public class Conversation {

    @Id
    private String id;

    /**
     * ID of the customer participant.
     * References the shared user store — type is String (MongoDB ObjectId as string).
     */
    @Field("customerId")
    private String customerId;

    /**
     * ID of the provider participant.
     * References the shared user store — type is String (MongoDB ObjectId as string).
     */
    @Field("providerId")
    private String providerId;

    /**
     * Optional reference to the service listing this conversation is about.
     * Null when the conversation was initiated without a specific service context.
     */
    @Field("serviceId")
    private String serviceId;

    /**
     * Optional reference to a booking associated with this conversation.
     * Null when the conversation has no booking context.
     */
    @Field("bookingId")
    private String bookingId;

    /**
     * Timestamp of the most recently sent message.
     * Used for sorting conversation lists newest-first.
     * Set to {@code createdAt} when no messages have been sent yet.
     */
    @Field("lastMessageAt")
    private Instant lastMessageAt;

    /**
     * Truncated preview of the last message (≤ 120 characters).
     * Denormalised here so that the conversation list does not require
     * a join/lookup into the messages collection.
     */
    @Field("lastMessageText")
    private String lastMessageText;

    /**
     * Number of messages the customer has not yet read.
     * Reset to 0 when the customer calls the mark-as-read endpoint.
     */
    @Field("customerUnread")
    private int customerUnread;

    /**
     * Number of messages the provider has not yet read.
     * Reset to 0 when the provider calls the mark-as-read endpoint.
     */
    @Field("providerUnread")
    private int providerUnread;

    @CreatedDate
    @Field("createdAt")
    private Instant createdAt;

    @LastModifiedDate
    @Field("updatedAt")
    private Instant updatedAt;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public Conversation() {
    }

    public Conversation(String customerId, String providerId) {
        this.customerId = customerId;
        this.providerId = providerId;
    }

    // -----------------------------------------------------------------------
    // Getters and setters
    // -----------------------------------------------------------------------

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public Instant getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(Instant lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public String getLastMessageText() {
        return lastMessageText;
    }

    public void setLastMessageText(String lastMessageText) {
        this.lastMessageText = lastMessageText;
    }

    public int getCustomerUnread() {
        return customerUnread;
    }

    public void setCustomerUnread(int customerUnread) {
        this.customerUnread = customerUnread;
    }

    public int getProviderUnread() {
        return providerUnread;
    }

    public void setProviderUnread(int providerUnread) {
        this.providerUnread = providerUnread;
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
