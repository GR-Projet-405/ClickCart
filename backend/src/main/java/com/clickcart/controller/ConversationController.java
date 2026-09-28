package com.clickcart.controller;

import com.clickcart.dto.CreateConversationRequest;
import com.clickcart.model.BookingEvent;
import com.clickcart.model.Conversation;
import com.clickcart.service.BookingEventService;
import com.clickcart.service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST endpoints for booking-linked conversations.
 *
 * Authorization strategy (without full Spring Security in place yet):
 * The caller passes userId and role as query params. The service layer
 * verifies that userId matches the customerId or providerId on the conversation.
 * This is production-ready once the auth system supplies these from a JWT/session.
 */
@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    private final BookingEventService bookingEventService;

    public ConversationController(ConversationService conversationService,
                                  BookingEventService bookingEventService) {
        this.conversationService = conversationService;
        this.bookingEventService = bookingEventService;
    }

    /**
     * POST /api/conversations
     * Create a new conversation for a booking, or return the existing one.
     */
    @PostMapping
    public ResponseEntity<Conversation> createConversation(
            @Valid @RequestBody CreateConversationRequest req) {
        Conversation conv = conversationService.createOrGetConversation(req);
        // Seed initial booking events on first creation only
        List<BookingEvent> existingEvents =
                bookingEventService.getEventsForConversation(conv.getId());
        if (existingEvents.isEmpty()) {
            bookingEventService.seedInitialEvents(
                    conv.getBookingId(), conv.getId(), conv.getBookingStatus());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(conv);
    }

    /**
     * GET /api/conversations?userId=&role=CUSTOMER|PROVIDER
     * List all conversations for the authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<Conversation>> getConversations(
            @RequestParam String userId,
            @RequestParam String role) {
        List<Conversation> result = "PROVIDER".equalsIgnoreCase(role)
                ? conversationService.getConversationsForProvider(userId)
                : conversationService.getConversationsForCustomer(userId);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/conversations/{id}?userId=&role=
     * Get a single conversation (verifies ownership).
     */
    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getConversation(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam String role) {
        Conversation conv = conversationService.getConversation(id, userId, role);
        return ResponseEntity.ok(conv);
    }

    /**
     * GET /api/conversations/{id}/events?userId=&role=
     * Get booking status events for the conversation timeline.
     */
    @GetMapping("/{id}/events")
    public ResponseEntity<List<BookingEvent>> getEvents(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam String role) {
        // Verify access
        conversationService.getConversation(id, userId, role);
        List<BookingEvent> events = bookingEventService.getEventsForConversation(id);
        return ResponseEntity.ok(events);
    }

    /**
     * POST /api/conversations/{id}/events
     * Publish a new booking event (e.g. status change).
     */
    @PostMapping("/{id}/events")
    public ResponseEntity<BookingEvent> publishEvent(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam String role,
            @RequestBody BookingEvent event) {
        Conversation conv = conversationService.getConversation(id, userId, role);
        BookingEvent saved = bookingEventService.publishEvent(
                conv.getBookingId(), id,
                event.getEventType(), event.getLabel(),
                event.getDescription(), event.getState());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * PATCH /api/conversations/{id}/read?userId=&role=
     * Mark all messages in this conversation as read for the caller.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam String role) {
        conversationService.markRead(id, userId, role);
        return ResponseEntity.noContent().build();
    }
}
