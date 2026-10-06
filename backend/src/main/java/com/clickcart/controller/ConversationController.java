package com.clickcart.controller;

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

import com.clickcart.dto.CreateConversationRequest;
import com.clickcart.dto.messaging.ConversationDetailResponse;
import com.clickcart.dto.messaging.ConversationSummaryResponse;
import com.clickcart.dto.messaging.CreateOrFindConversationRequest;
import com.clickcart.dto.messaging.MessageResponse;
import com.clickcart.dto.messaging.PagedMessagesResponse;
import com.clickcart.dto.messaging.SendMessageRequest;
import com.clickcart.model.BookingEvent;
import com.clickcart.model.Conversation;
import com.clickcart.model.SenderRole;
import com.clickcart.service.BookingEventService;
import com.clickcart.service.ConversationService;
import com.clickcart.service.MessageService;
import com.clickcart.exception.AccessForbiddenException;

/**
 * REST endpoints for messaging and booking-linked conversations.
 */
@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService conversationService;
    private final BookingEventService bookingEventService;
    private final MessageService messageService;

    public ConversationController(ConversationService conversationService,
            BookingEventService bookingEventService,
            MessageService messageService) {
        this.conversationService = conversationService;
        this.bookingEventService = bookingEventService;
        this.messageService = messageService;
    }

    private String getUserId(Principal principal) {
        if (principal == null) {
            throw new AccessForbiddenException("Not authenticated");
        }
        return principal.getName();
    }

    // ==========================================
    // Messaging API (DEV-25)
    // ==========================================

    @PostMapping("/new")
    public ResponseEntity<ConversationSummaryResponse> createOrFindConversation(
            Principal principal,
            @Valid @RequestBody CreateOrFindConversationRequest request) {
        String currentUserId = getUserId(principal);
        ConversationSummaryResponse response = conversationService.getOrCreateConversation(currentUserId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/list")
    public ResponseEntity<List<ConversationSummaryResponse>> listConversations(
            Principal principal,
            @RequestParam(name = "role", defaultValue = "CUSTOMER") SenderRole role,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        String currentUserId = getUserId(principal);
        Pageable pageable = PageRequest.of(page, size);
        List<ConversationSummaryResponse> response = conversationService.listConversations(currentUserId, role,
                pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/detail/{conversationId}")
    public ResponseEntity<ConversationDetailResponse> getConversationDetail(
            Principal principal,
            @PathVariable("conversationId") String conversationId,
            @RequestParam(name = "page", defaultValue = "0") int messagePage,
            @RequestParam(name = "size", defaultValue = "20") int messageSize) {
        String currentUserId = getUserId(principal);
        ConversationDetailResponse response = conversationService.getConversationDetail(conversationId, currentUserId,
                messagePage, messageSize);
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

    // ==========================================
    // Booking Event APIs
    // ==========================================

    @PostMapping
    public ResponseEntity<Conversation> createConversationForBooking(
            @Valid @RequestBody CreateConversationRequest req) {
        Conversation conv = conversationService.createOrGetConversationForBooking(req);
        // Seed initial booking events on first creation only
        List<BookingEvent> existingEvents = bookingEventService.getEventsForConversation(conv.getId());
        if (existingEvents.isEmpty()) {
            bookingEventService.seedInitialEvents(
                    conv.getBookingId(), conv.getId(), conv.getBookingStatus());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(conv);
    }

    @GetMapping
    public ResponseEntity<List<Conversation>> getConversations(
            @RequestParam String userId,
            @RequestParam String role) {
        List<Conversation> result = "PROVIDER".equalsIgnoreCase(role)
                ? conversationService.getConversationsForProvider(userId)
                : conversationService.getConversationsForCustomer(userId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Conversation> getConversation(
            @PathVariable String id,
            @RequestParam String userId,
            @RequestParam String role) {
        Conversation conv = conversationService.getConversation(id, userId, role);
        return ResponseEntity.ok(conv);
    }

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
}