package com.clickcart.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * A booking status event that appears in the conversation timeline.
 * Examples: "Booking Confirmed", "Provider Assigned", "Service Completed".
 */
@Document(collection = "booking_events")
public class BookingEvent {

    @Id
    private String id;

    @Indexed
    private String bookingId;

    @Indexed
    private String conversationId;

    /**
     * Event types that map to specific UI indicators.
     * CONFIRMED, PROVIDER_ASSIGNED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, PENDING
     */
    private String eventType;

    /** Human-readable label shown in the timeline. */
    private String label;

    /** Optional description or additional context. */
    private String description;

    /** Timeline state: "done", "active", "pending". */
    private String state;

    @CreatedDate
    private Instant occurredAt;

    // ── Constructors ──────────────────────────────────────────────────────────

    public BookingEvent() {}

    public BookingEvent(String bookingId, String conversationId, String eventType,
                        String label, String description, String state) {
        this.bookingId = bookingId;
        this.conversationId = conversationId;
        this.eventType = eventType;
        this.label = label;
        this.description = description;
        this.state = state;
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Instant getOccurredAt() { return occurredAt; }
    public void setOccurredAt(Instant occurredAt) { this.occurredAt = occurredAt; }
}
