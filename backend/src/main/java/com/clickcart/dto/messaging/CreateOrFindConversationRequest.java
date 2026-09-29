package com.clickcart.dto.messaging;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload sent by a CUSTOMER to open or resume a conversation
 * with a specific service provider.
 *
 * <p>If a conversation between the authenticated customer and {@code providerId}
 * already exists it is returned unchanged; otherwise a new one is created.
 * Both {@code serviceId} and {@code bookingId} are optional context hints that
 * help the provider understand the subject of the conversation.</p>
 */
public class CreateOrFindConversationRequest {

    /**
     * ID of the provider the customer wants to message.
     * Must match a valid user with the PROVIDER role.
     */
    @NotBlank(message = "providerId is required")
    private String providerId;

    /**
     * Optional ID of the service listing this conversation is about.
     */
    private String serviceId;

    /**
     * Optional ID of a booking associated with this conversation.
     */
    private String bookingId;

    // -----------------------------------------------------------------------
    // Constructors
    // -----------------------------------------------------------------------

    public CreateOrFindConversationRequest() {
    }

    public CreateOrFindConversationRequest(String providerId, String serviceId, String bookingId) {
        this.providerId = providerId;
        this.serviceId = serviceId;
        this.bookingId = bookingId;
    }

    // -----------------------------------------------------------------------
    // Getters and setters
    // -----------------------------------------------------------------------

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
}
