package com.clickcart.service;

import com.clickcart.dto.CreateConversationRequest;
import com.clickcart.exception.AccessDeniedException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Conversation;
import com.clickcart.repository.ConversationRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepo;

    public ConversationService(ConversationRepository conversationRepo) {
        this.conversationRepo = conversationRepo;
    }

    // ── Create ────────────────────────────────────────────────────────────────

    /**
     * Creates a new conversation for a booking, or returns the existing one
     * if one already exists for the same bookingId.
     */
    public Conversation createOrGetConversation(CreateConversationRequest req) {
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

    // ── Read ──────────────────────────────────────────────────────────────────

    /** All conversations for a customer, newest first. */
    public List<Conversation> getConversationsForCustomer(String customerId) {
        return conversationRepo.findByCustomerIdOrderByLastMessageAtDesc(customerId);
    }

    /** All conversations for a provider, newest first. */
    public List<Conversation> getConversationsForProvider(String providerId) {
        return conversationRepo.findByProviderIdOrderByLastMessageAtDesc(providerId);
    }

    /**
     * Fetches a single conversation, verifying the caller belongs to it.
     * Accepts role "CUSTOMER" or "PROVIDER".
     */
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

    // ── Update ────────────────────────────────────────────────────────────────

    /** Called after a new message is sent to keep the conversation list preview current. */
    public void updateLastMessage(String conversationId, String preview, String senderRole) {
        conversationRepo.findById(conversationId).ifPresent(conv -> {
            conv.setLastMessagePreview(preview);
            conv.setLastMessageAt(Instant.now());

            // Increment unread count for the OTHER side
            if ("CUSTOMER".equalsIgnoreCase(senderRole)) {
                conv.setUnreadByProvider(conv.getUnreadByProvider() + 1);
            } else if ("PROVIDER".equalsIgnoreCase(senderRole)) {
                conv.setUnreadByCustomer(conv.getUnreadByCustomer() + 1);
            }
            conversationRepo.save(conv);
        });
    }

    /** Mark messages as read — reset the caller's unread counter. */
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
}
