package com.clickcart.controller;

import java.security.Principal;
import java.util.List;
import java.util.Locale;

import jakarta.validation.Valid;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
 *
 * <p>The caller's identity is always taken from the authenticated principal.
 * Legacy {@code userId}/{@code role} query parameters are no longer trusted.</p>
 */
@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private static final int MAX_PAGE_SIZE = 100;
    private static final String INVALID_ROLE_MESSAGE = "role must be CUSTOMER or PROVIDER";

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
        if (principal == null || principal.getName() == null) {
            throw new AccessForbiddenException("Not authenticated");
        }
        return principal.getName();
    }

    /**
     * Resolves the conversation-list role. An explicit {@code role} parameter wins;
     * otherwise the role is derived from the caller's granted authorities.
     */
    private SenderRole resolveRole(String role, Principal principal) {
        if (role == null || role.isBlank()) {
            boolean isProvider = principal instanceof Authentication auth
                    && auth.getAuthorities().stream()
                            .anyMatch(a -> "ROLE_SERVICE_PROVIDER".equals(a.getAuthority()));
            return isProvider ? SenderRole.PROVIDER : SenderRole.CUSTOMER;
        }
        return switch (role.trim().toUpperCase(Locale.ROOT)) {
            case "CUSTOMER" -> SenderRole.CUSTOMER;
            case "PROVIDER", "SERVICE_PROVIDER" -> SenderRole.PROVIDER;
            default -> throw new IllegalArgumentException(INVALID_ROLE_MESSAGE);
        };
    }

    private static Pageable pageOf(int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        return PageRequest.of(safePage, safeSize);
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

    /**
     * Paginated conversation list. {@code /list} is kept as an alias for older callers.
     */
    @GetMapping({ "", "/list" })
    public ResponseEntity<List<ConversationSummaryResponse>> listConversations(
            Principal principal,
            @RequestParam(name = "role", required = false) String role,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        String currentUserId = getUserId(principal);
        SenderRole senderRole = resolveRole(role, principal);
        List<ConversationSummaryResponse> response = conversationService.listConversations(currentUserId,
                senderRole, pageOf(page, size));
        return ResponseEntity.ok(response);
    }

    /**
     * Conversation detail with the first page of messages. {@code /detail/{id}} is kept as an alias.
     */
    @GetMapping({ "/{conversationId}", "/detail/{conversationId}" })
    public ResponseEntity<ConversationDetailResponse> getConversationDetail(
            Principal principal,
            @PathVariable("conversationId") String conversationId,
            @RequestParam(name = "page", defaultValue = "0") int messagePage,
            @RequestParam(name = "size", defaultValue = "20") int messageSize) {
        String currentUserId = getUserId(principal);
        Pageable pageable = pageOf(messagePage, messageSize);
        ConversationDetailResponse response = conversationService.getConversationDetail(conversationId, currentUserId,
                pageable.getPageNumber(), pageable.getPageSize());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<PagedMessagesResponse> getMessages(
            Principal principal,
            @PathVariable("conversationId") String conversationId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        String currentUserId = getUserId(principal);
        PagedMessagesResponse response = messageService.getMessages(conversationId, currentUserId,
                pageOf(page, size));
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

    @GetMapping("/{id}/events")
    public ResponseEntity<List<BookingEvent>> getEvents(
            Principal principal,
            @PathVariable String id) {
        // Verify access
        conversationService.getParticipantConversation(id, getUserId(principal));
        List<BookingEvent> events = bookingEventService.getEventsForConversation(id);
        return ResponseEntity.ok(events);
    }

    @PostMapping("/{id}/events")
    public ResponseEntity<BookingEvent> publishEvent(
            Principal principal,
            @PathVariable String id,
            @RequestBody BookingEvent event) {
        Conversation conv = conversationService.getParticipantConversation(id, getUserId(principal));
        BookingEvent saved = bookingEventService.publishEvent(
                conv.getBookingId(), id,
                event.getEventType(), event.getLabel(),
                event.getDescription(), event.getState());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}