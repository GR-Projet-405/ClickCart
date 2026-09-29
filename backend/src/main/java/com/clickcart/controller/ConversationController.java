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
import java.security.Principal;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.clickcart.dto.messaging.ConversationDetailResponse;
import com.clickcart.dto.messaging.ConversationSummaryResponse;
import com.clickcart.dto.messaging.CreateOrFindConversationRequest;
import com.clickcart.dto.messaging.MessageResponse;
import com.clickcart.dto.messaging.PagedMessagesResponse;
import com.clickcart.dto.messaging.SendMessageRequest;
import com.clickcart.model.SenderRole;
import com.clickcart.service.ConversationService;
import com.clickcart.service.MessageService;
import com.clickcart.exception.AccessForbiddenException;

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
    private final MessageService messageService;

    public ConversationController(ConversationService conversationService, MessageService messageService) {
        this.conversationService = conversationService;
        this.messageService = messageService;
    }

    private String getUserId(Principal principal) {
        if (principal == null) {
            // In a fully secured app, this is prevented by the auth filter.
            throw new AccessForbiddenException("Not authenticated");
        }
        return principal.getName();
    }

    @PostMapping
    public ResponseEntity<ConversationSummaryResponse> createOrFindConversation(
            Principal principal,
            @Valid @RequestBody CreateOrFindConversationRequest request) {
        String currentUserId = getUserId(principal);
        
        // TODO(DEV-auth): Enforce CUSTOMER role check via Spring Security @PreAuthorize
        
        ConversationSummaryResponse response = conversationService.getOrCreateConversation(currentUserId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ConversationSummaryResponse>> listConversations(
            Principal principal,
            @RequestParam(name = "role", defaultValue = "CUSTOMER") SenderRole role,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        String currentUserId = getUserId(principal);
        Pageable pageable = PageRequest.of(page, size);
        List<ConversationSummaryResponse> response = conversationService.listConversations(currentUserId, role, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<ConversationDetailResponse> getConversationDetail(
            Principal principal,
            @PathVariable("conversationId") String conversationId,
            @RequestParam(name = "page", defaultValue = "0") int messagePage,
            @RequestParam(name = "size", defaultValue = "20") int messageSize) {
        String currentUserId = getUserId(principal);
        ConversationDetailResponse response = conversationService.getConversation(conversationId, currentUserId, messagePage, messageSize);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<PagedMessagesResponse> getMessages(
            Principal principal,
            @PathVariable("conversationId") String conversationId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        String currentUserId = getUserId(principal);
        Pageable pageable = PageRequest.of(page, size);
        PagedMessagesResponse response = messageService.getMessages(conversationId, currentUserId, pageable);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<MessageResponse> sendMessage(
            Principal principal,
            @PathVariable("conversationId") String conversationId,
            @Valid @RequestBody SendMessageRequest request) {
        String currentUserId = getUserId(principal);
        MessageResponse response = messageService.sendMessage(conversationId, currentUserId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{conversationId}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAsRead(
            Principal principal,
            @PathVariable("conversationId") String conversationId) {
        String currentUserId = getUserId(principal);
        messageService.markAsRead(conversationId, currentUserId);
    }
}
