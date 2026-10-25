package com.clickcart.service;

import com.clickcart.dto.CreateConversationRequest;
import com.clickcart.dto.messaging.ConversationDetailResponse;
import com.clickcart.dto.messaging.ConversationSummaryResponse;
import com.clickcart.dto.messaging.CreateOrFindConversationRequest;
import com.clickcart.dto.messaging.PagedMessagesResponse;
import com.clickcart.exception.AccessDeniedException;
import com.clickcart.exception.AccessForbiddenException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Conversation;
import com.clickcart.model.SenderRole;
import com.clickcart.repository.ConversationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ConversationService {

    private static final Logger log = LoggerFactory.getLogger(ConversationService.class);
    private static final int PREVIEW_MAX_LENGTH = 120;

    @org.springframework.beans.factory.annotation.Autowired private com.clickcart.repository.BookingRepository bookings;
    @org.springframework.beans.factory.annotation.Autowired private com.clickcart.repository.UserRepository users;
    private final ConversationRepository conversationRepo;
    private final MessageService messageService;

    // Use @Lazy on MessageService to avoid Circular Dependency issues if they
    // reference each other
    public ConversationService(ConversationRepository conversationRepo, @Lazy MessageService messageService) {
        this.conversationRepo = conversationRepo;
        this.messageService = messageService;
    }

    // ==========================================
    // Legacy Booking Conversation Methods
    // ==========================================

    public Conversation createOrGetConversationForBooking(CreateConversationRequest req) {
        var request = new CreateOrFindConversationRequest();
        request.setBookingId(req.getBookingId()); request.setProviderId(req.getProviderId()); request.setServiceId(req.getServiceId());
        var summary = getOrCreateConversation(com.clickcart.security.CurrentCustomer.id(), request);
        return findConversationById(summary.id());
    }

    public List<Conversation> getConversationsForCustomer(String customerId) {
        return conversationRepo.findByCustomerIdOrderByLastMessageAtDesc(customerId);
    }

    public List<Conversation> getConversationsForProvider(String providerId) {
        return conversationRepo.findByProviderIdOrderByLastMessageAtDesc(providerId);
    }

    public Conversation getConversation(String conversationId, String userId, String role) {
        Conversation conv = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found: " + conversationId));

        if ("CUSTOMER".equalsIgnoreCase(role)) {
            if (userId == null || !userId.equals(conv.getCustomerId())) {
                throw new AccessDeniedException("You do not have access to this conversation.");
            }
        } else if ("PROVIDER".equalsIgnoreCase(role)) {
            if (userId == null || !userId.equals(conv.getProviderId())) {
                throw new AccessDeniedException("You do not have access to this conversation.");
            }
        } else {
            throw new AccessDeniedException("Invalid role.");
        }
        return conv;
    }

    /**
     * Loads a conversation and verifies the caller (resolved from the security principal)
     * is one of its participants. Throws 404 if missing and 403 if not a participant.
     */
    public Conversation getParticipantConversation(String conversationId, String currentUserId) {
        Conversation conv = findConversationById(conversationId);
        assertParticipant(conv, currentUserId);
        return conv;
    }

    public void updateLastMessage(String conversationId, String preview, String senderRole) {
        conversationRepo.findById(conversationId).ifPresent(conv -> {
            conv.setLastMessagePreview(preview);
            conv.setLastMessageAt(Instant.now());

            if ("CUSTOMER".equalsIgnoreCase(senderRole)) {
                conv.setUnreadByProvider(conv.getUnreadByProvider() + 1);
            } else if ("PROVIDER".equalsIgnoreCase(senderRole)) {
                conv.setUnreadByCustomer(conv.getUnreadByCustomer() + 1);
            }
            conversationRepo.save(conv);
        });
    }

    public void markRead(String conversationId, String userId, String role) {
        conversationRepo.findById(conversationId).ifPresent(conv -> {
            if ("CUSTOMER".equalsIgnoreCase(role) && userId != null && userId.equals(conv.getCustomerId())) {
                conv.setUnreadByCustomer(0);
                conversationRepo.save(conv);
            } else if ("PROVIDER".equalsIgnoreCase(role) && userId != null && userId.equals(conv.getProviderId())) {
                conv.setUnreadByProvider(0);
                conversationRepo.save(conv);
            }
        });
    }

    // ==========================================
    // New Messaging API Methods (DEV-25)
    // ==========================================

    public ConversationSummaryResponse getOrCreateConversation(String customerId,
            CreateOrFindConversationRequest request) {
        var customer = users.findById(customerId).filter(u -> u.getRole()==com.clickcart.model.Role.CUSTOMER)
            .orElseThrow(() -> new AccessForbiddenException("Customer account required"));
        String providerId = request.getProviderId();
        var provider = users.findById(providerId).filter(u -> u.getRole()==com.clickcart.model.Role.SERVICE_PROVIDER)
            .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        com.clickcart.model.Booking booking = null;
        if (request.getBookingId()!=null && !request.getBookingId().isBlank()) {
            booking=bookings.findById(request.getBookingId()).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
            if(!customerId.equals(booking.getCustomerId()) || !providerId.equals(booking.getProviderId())) throw new AccessForbiddenException("Booking participants do not match");
        }
        Conversation conversation = (booking == null ? conversationRepo.findByCustomerIdAndProviderId(customerId, providerId) : conversationRepo.findByBookingId(booking.getId()))
            .orElseGet(() -> new Conversation(customerId, providerId));
        assertParticipant(conversation, customerId);
        conversation.setCustomerName(customer.getFullName()); conversation.setProviderName(provider.getFullName());
        if (booking != null) {
            conversation.setBookingId(booking.getId()); conversation.setServiceId(booking.getServiceId());
            conversation.setServiceName(booking.getServiceTitle()); conversation.setServiceCategory(booking.getServiceCategory());
            conversation.setBookingStatus(booking.getStatus().name());
        }
        if(conversation.getLastMessageAt()==null) conversation.setLastMessageAt(Instant.now());
        conversation=conversationRepo.save(conversation);

        return toSummary(conversation, customerId, SenderRole.CUSTOMER);
    }

    public List<ConversationSummaryResponse> listConversations(String currentUserId, SenderRole role,
            Pageable pageable) {
        Slice<Conversation> slice = switch (role) {
            case CUSTOMER -> conversationRepo.findByCustomerIdOrderByLastMessageAtDesc(currentUserId, pageable);
            case PROVIDER -> conversationRepo.findByProviderIdOrderByLastMessageAtDesc(currentUserId, pageable);
        };

        return slice.getContent().stream()
                .map(conv -> toSummary(conv, currentUserId, role))
                .toList();
    }

    public ConversationDetailResponse getConversationDetail(String conversationId, String currentUserId,
            int messagePage, int messageSize) {
        Conversation conv = findConversationById(conversationId);
        assertParticipant(conv, currentUserId);

        PagedMessagesResponse messages = messageService
                .getMessages(conversationId, currentUserId, PageRequest.of(messagePage, messageSize));

        boolean isCustomer = currentUserId.equals(conv.getCustomerId());
        String storedName = isCustomer ? conv.getProviderName() : conv.getCustomerName();
        String otherPartyId = isCustomer ? conv.getProviderId() : conv.getCustomerId();
        String otherPartyName = (storedName != null && !storedName.isBlank()) ? storedName : otherPartyId;
        String otherPartyAvatarUrl = isCustomer ? conv.getProviderAvatarFallback() : conv.getCustomerAvatarFallback();

        return new ConversationDetailResponse(
                conv.getId(),
                conv.getCustomerId(),
                conv.getProviderId(),
                conv.getServiceId(),
                conv.getBookingId(),
                conv.getCreatedAt(),
                messages,
                otherPartyName,
                otherPartyAvatarUrl);
    }

    // -----------------------------------------------------------------------
    // Package-visible helpers (used by MessageService)
    // -----------------------------------------------------------------------

    Conversation findConversationById(String conversationId) {
        return conversationRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
    }

    void assertParticipant(Conversation conversation, String currentUserId) {
        boolean isParticipant = currentUserId != null
                && (currentUserId.equals(conversation.getCustomerId())
                        || currentUserId.equals(conversation.getProviderId()));
        if (!isParticipant) {
            log.warn("Access denied: userId={} is not a participant of conversationId={}", currentUserId,
                    conversation.getId());
            throw new AccessForbiddenException("conversation", conversation.getId());
        }
    }

    SenderRole roleOf(Conversation conversation, String currentUserId) {
        return currentUserId.equals(conversation.getCustomerId()) ? SenderRole.CUSTOMER : SenderRole.PROVIDER;
    }

    // -----------------------------------------------------------------------
    // Private mapping helpers
    // -----------------------------------------------------------------------

    private ConversationSummaryResponse toSummary(Conversation conv, String currentUserId, SenderRole role) {
        boolean isCustomer = role == SenderRole.CUSTOMER;
        String otherPartyId = isCustomer ? conv.getProviderId() : conv.getCustomerId();
        int unreadCount = isCustomer ? conv.getUnreadByCustomer() : conv.getUnreadByProvider();

        // Placeholder until User service is wired: prefer the stored display name, fall back to the ID
        String storedName = isCustomer ? conv.getProviderName() : conv.getCustomerName();
        String otherPartyName = (storedName != null && !storedName.isBlank()) ? storedName : otherPartyId;
        String otherPartyAvatarUrl = null;

        return new ConversationSummaryResponse(
                conv.getId(),
                otherPartyId,
                otherPartyName,
                otherPartyAvatarUrl,
                conv.getServiceId(),
                conv.getBookingId(),
                conv.getLastMessagePreview(),
                conv.getLastMessageAt(),
                unreadCount,
                conv.getBookingStatus());
    }
}