package com.clickcart.service;

import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import com.clickcart.dto.messaging.ConversationDetailResponse;
import com.clickcart.dto.messaging.ConversationSummaryResponse;
import com.clickcart.dto.messaging.CreateOrFindConversationRequest;
import com.clickcart.dto.messaging.PagedMessagesResponse;
import com.clickcart.exception.AccessForbiddenException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Conversation;
import com.clickcart.model.SenderRole;
import com.clickcart.repository.ConversationRepository;
import com.clickcart.repository.MessageRepository;

/**
 * Business logic for conversation lifecycle management.
 *
 * <p>Responsibilities:
 * <ul>
 *   <li>Create-or-find a conversation between a customer and a provider.</li>
 *   <li>List conversations for either a customer or a provider.</li>
 *   <li>Fetch the full detail of a single conversation (with its first message page).</li>
 * </ul>
 *
 * <p><strong>Ownership rule:</strong> every write and read operation that touches a
 * specific conversation calls {@link #assertParticipant} before proceeding.
 * A user who is neither {@code customerId} nor {@code providerId} of the conversation
 * receives a {@code 403} regardless of their role.</p>
 *
 * <p><strong>User profile resolution:</strong> {@code otherPartyName} and
 * {@code otherPartyAvatarUrl} in {@link ConversationSummaryResponse} are populated
 * with placeholder values until the shared User service is available.
 * {@code TODO(DEV-auth): inject UserProfileService and resolve display name + avatar.}</p>
 */
@Service
public class ConversationService {

    private static final Logger log = LoggerFactory.getLogger(ConversationService.class);

    /** Maximum length of the last-message preview stored on the conversation document. */
    private static final int PREVIEW_MAX_LENGTH = 120;

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final MessageService messageService;

    public ConversationService(ConversationRepository conversationRepository,
                               MessageRepository messageRepository,
                               MessageService messageService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.messageService = messageService;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Finds an existing conversation between {@code customerId} and the provider
     * specified in {@code request}, or creates a new one if none exists.
     *
     * <p>Idempotent: calling this multiple times with the same pair returns the
     * same conversation. The unique index on {@code { customerId, providerId }}
     * prevents race-condition duplicates at the database level.</p>
     *
     * @param customerId the authenticated customer's user ID
     * @param request    contains the provider ID and optional service/booking context
     * @return a summary of the found-or-created conversation
     */
    public ConversationSummaryResponse getOrCreateConversation(String customerId,
                                                               CreateOrFindConversationRequest request) {
        String providerId = request.getProviderId();

        Conversation conversation = conversationRepository
                .findByCustomerIdAndProviderId(customerId, providerId)
                .orElseGet(() -> {
                    log.info("Creating new conversation: customerId={}, providerId={}", customerId, providerId);
                    Conversation newConv = new Conversation(customerId, providerId);
                    newConv.setServiceId(request.getServiceId());
                    newConv.setBookingId(request.getBookingId());
                    newConv.setLastMessageAt(Instant.now());
                    return conversationRepository.save(newConv);
                });

        return toSummary(conversation, customerId, SenderRole.CUSTOMER);
    }

    /**
     * Returns a paginated list of conversations for the current user, ordered
     * by the most recently active conversation first.
     *
     * @param currentUserId the authenticated user's ID
     * @param role          the user's marketplace role in this request context
     * @param pageable      pagination parameters ({@code page}, {@code size})
     * @return list of conversation summaries; empty list if none exist
     */
    public List<ConversationSummaryResponse> listConversations(String currentUserId,
                                                               SenderRole role,
                                                               Pageable pageable) {
        Slice<Conversation> slice = switch (role) {
            case CUSTOMER -> conversationRepository
                    .findByCustomerIdOrderByLastMessageAtDesc(currentUserId, pageable);
            case PROVIDER -> conversationRepository
                    .findByProviderIdOrderByLastMessageAtDesc(currentUserId, pageable);
        };

        return slice.getContent().stream()
                .map(conv -> toSummary(conv, currentUserId, role))
                .toList();
    }

    /**
     * Fetches the detail of a single conversation together with its first page
     * of messages (oldest-first).
     *
     * <p>Triggers an ownership check: only the customer and the provider who
     * are participants of this conversation may call this method.</p>
     *
     * @param conversationId the conversation document ID
     * @param currentUserId  the authenticated user's ID
     * @param messagePage    the message page to embed (usually 0 on first open)
     * @param messageSize    the message page size
     * @return conversation metadata with an embedded message page
     * @throws ResourceNotFoundException if no conversation with that ID exists
     * @throws AccessForbiddenException  if the caller is not a participant
     */
    public ConversationDetailResponse getConversation(String conversationId,
                                                      String currentUserId,
                                                      int messagePage,
                                                      int messageSize) {
        Conversation conv = findConversationById(conversationId);
        assertParticipant(conv, currentUserId);

        PagedMessagesResponse messages = messageService
                .getMessages(conversationId, currentUserId,
                        org.springframework.data.domain.PageRequest.of(messagePage, messageSize));

        return new ConversationDetailResponse(
                conv.getId(),
                conv.getCustomerId(),
                conv.getProviderId(),
                conv.getServiceId(),
                conv.getBookingId(),
                conv.getCreatedAt(),
                messages
        );
    }

    // -----------------------------------------------------------------------
    // Package-visible helpers (used by MessageService)
    // -----------------------------------------------------------------------

    /**
     * Retrieves a conversation by ID or throws {@link ResourceNotFoundException}.
     *
     * @param conversationId the conversation document ID
     * @return the conversation document
     */
    Conversation findConversationById(String conversationId) {
        return conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", conversationId));
    }

    /**
     * Asserts that {@code currentUserId} is either the customer or the provider
     * of {@code conversation}. Throws {@link AccessForbiddenException} otherwise.
     *
     * @param conversation  the conversation to check
     * @param currentUserId the user claiming access
     */
    void assertParticipant(Conversation conversation, String currentUserId) {
        boolean isParticipant = currentUserId.equals(conversation.getCustomerId())
                || currentUserId.equals(conversation.getProviderId());
        if (!isParticipant) {
            log.warn("Access denied: userId={} is not a participant of conversationId={}",
                    currentUserId, conversation.getId());
            throw new AccessForbiddenException("conversation", conversation.getId());
        }
    }

    /**
     * Determines the {@link SenderRole} for {@code currentUserId} within
     * {@code conversation}.  Called by {@link MessageService} when persisting
     * a message, so the role does not need to be passed down from the controller.
     *
     * @param conversation  the conversation context
     * @param currentUserId the authenticated user's ID
     * @return {@code CUSTOMER} if the user is the customer, {@code PROVIDER} otherwise
     */
    SenderRole roleOf(Conversation conversation, String currentUserId) {
        return currentUserId.equals(conversation.getCustomerId())
                ? SenderRole.CUSTOMER
                : SenderRole.PROVIDER;
    }

    // -----------------------------------------------------------------------
    // Private mapping helpers
    // -----------------------------------------------------------------------

    /**
     * Maps a {@link Conversation} document to a {@link ConversationSummaryResponse}
     * from the perspective of {@code currentUserId}.
     *
     * <p>{@code otherPartyName} is currently set to the raw user ID as a placeholder.
     * {@code TODO(DEV-auth): replace with UserProfileService.getDisplayName(otherPartyId)}</p>
     */
    private ConversationSummaryResponse toSummary(Conversation conv,
                                                   String currentUserId,
                                                   SenderRole role) {
        boolean isCustomer = role == SenderRole.CUSTOMER;
        String otherPartyId = isCustomer ? conv.getProviderId() : conv.getCustomerId();
        int unreadCount    = isCustomer ? conv.getCustomerUnread() : conv.getProviderUnread();

        // TODO(DEV-auth): resolve display name and avatar URL from shared UserProfileService
        String otherPartyName      = otherPartyId;   // placeholder until User service is wired
        String otherPartyAvatarUrl = null;            // placeholder

        return new ConversationSummaryResponse(
                conv.getId(),
                otherPartyId,
                otherPartyName,
                otherPartyAvatarUrl,
                conv.getServiceId(),
                conv.getBookingId(),
                conv.getLastMessageText(),
                conv.getLastMessageAt(),
                unreadCount
        );
    }
}
