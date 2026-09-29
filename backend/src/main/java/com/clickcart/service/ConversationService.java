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
        return conversationRepo.findByBookingId(req.getBookingId())
                .orElseGet(() -> {
                    Conversation c = new Conversation();
                    c.setBookingId(req.getBookingId());
                    c.setCustomerId(req.getCustomerId());
                    c.setProviderId(req.getProviderId());
                    c.setServiceId(req.getServiceId());
                    c.setServiceName(req.getServiceName());
                    c.setServiceCategory(req.getServiceCategory());
                    c.setCustomerName(req.getCustomerName());
                    c.setCustomerAvatarFallback(req.getCustomerAvatarFallback());
                    c.setProviderName(req.getProviderName());
                    c.setProviderAvatarFallback(req.getProviderAvatarFallback());
                    c.setBookingStatus(req.getBookingStatus());
                    c.setLastMessageAt(Instant.now());
                    return conversationRepo.save(c);
                });
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
            if (!conv.getCustomerId().equals(userId)) {
                throw new AccessDeniedException("You do not have access to this conversation.");
            }
        } else if ("PROVIDER".equalsIgnoreCase(role)) {
            if (!conv.getProviderId().equals(userId)) {
                throw new AccessDeniedException("You do not have access to this conversation.");
            }
        } else {
            throw new AccessDeniedException("Invalid role.");
        }
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
            if ("CUSTOMER".equalsIgnoreCase(role) && conv.getCustomerId().equals(userId)) {
                conv.setUnreadByCustomer(0);
                conversationRepo.save(conv);
            } else if ("PROVIDER".equalsIgnoreCase(role) && conv.getProviderId().equals(userId)) {
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
        String providerId = request.getProviderId();

        Conversation conversation = conversationRepo
                .findByCustomerIdAndProviderId(customerId, providerId)
                .orElseGet(() -> {
                    log.info("Creating new conversation: customerId={}, providerId={}", customerId, providerId);
                    Conversation newConv = new Conversation(customerId, providerId);
                    newConv.setServiceId(request.getServiceId());
                    newConv.setBookingId(request.getBookingId());
                    newConv.setLastMessageAt(Instant.now());
                    return conversationRepo.save(newConv);
                });

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

        return new ConversationDetailResponse(
                conv.getId(),
                conv.getCustomerId(),
                conv.getProviderId(),
                conv.getServiceId(),
                conv.getBookingId(),
                conv.getCreatedAt(),
                messages);
    }

    // -----------------------------------------------------------------------
    // Package-visible helpers (used by MessageService)
    // -----------------------------------------------------------------------

    Conversation findConversationById(String conversationId) {
        return conversationRepo.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
    }

    void assertParticipant(Conversation conversation, String currentUserId) {
        boolean isParticipant = currentUserId.equals(conversation.getCustomerId())
                || currentUserId.equals(conversation.getProviderId());
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

        // Placeholder until User service is wired
        String otherPartyName = otherPartyId;
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
                unreadCount);
    }
}