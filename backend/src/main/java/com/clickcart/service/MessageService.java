package com.clickcart.service;

import com.clickcart.dto.SendMessageRequest;
import com.clickcart.exception.AccessDeniedException;
import com.clickcart.exception.InvalidAttachmentException;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Conversation;
import com.clickcart.model.Message;
import com.clickcart.repository.ConversationRepository;
import com.clickcart.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.Instant;
import java.util.*;

@Service
public class MessageService {

    // ── Configuration ─────────────────────────────────────────────────────────

    /** Directory where attachments are stored on disk. NOT web-accessible by path. */
    @Value("${clickcart.attachments.dir:${java.io.tmpdir}/clickcart-attachments}")
    private String attachmentsDir;

    /** Max file size in bytes: 10 MB. */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024L;

    /** Allowed MIME types for attachments. */
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    private final MessageRepository messageRepo;
    private final ConversationRepository conversationRepo;
    private final ConversationService conversationService;

    public MessageService(MessageRepository messageRepo,
                          ConversationRepository conversationRepo,
                          ConversationService conversationService) {
        this.messageRepo = messageRepo;
        this.conversationRepo = conversationRepo;
        this.conversationService = conversationService;
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * Fetches all messages for a conversation after verifying the caller has access.
     */
    public List<Message> getMessages(String conversationId, String userId, String role) {
        // Verify access
        conversationService.getConversation(conversationId, userId, role);
        return messageRepo.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    // ── Send text message ─────────────────────────────────────────────────────

    public Message sendMessage(SendMessageRequest req, String userId, String role) {
        // Verify caller belongs to this conversation
        Conversation conv = conversationService.getConversation(req.getConversationId(), userId, role);

        if (req.getType() == Message.MessageType.TEXT && !StringUtils.hasText(req.getContent())) {
            throw new IllegalArgumentException("Message content must not be empty.");
        }

        Message msg = new Message();
        msg.setConversationId(req.getConversationId());
        msg.setBookingId(conv.getBookingId());
        msg.setSenderId(userId);
        msg.setSenderRole(role.toUpperCase());
        msg.setType(req.getType());
        msg.setContent(req.getContent());
        msg.setReadByCustomer("CUSTOMER".equalsIgnoreCase(role));
        msg.setReadByProvider("PROVIDER".equalsIgnoreCase(role));

        Message saved = messageRepo.save(msg);

        // Update conversation preview
        String preview = req.getContent() != null
                ? req.getContent().substring(0, Math.min(req.getContent().length(), 80))
                : "[message]";
        conversationService.updateLastMessage(req.getConversationId(), preview, role);

        return saved;
    }

    // ── Upload attachment ─────────────────────────────────────────────────────

    public Message uploadAttachment(String conversationId, String userId, String role,
                                    MultipartFile file) throws IOException {
        // Verify access
        Conversation conv = conversationService.getConversation(conversationId, userId, role);

        // Validate file
        validateFile(file);

        // Sanitise and store file
        String storedName = storeFile(file, conversationId);

        // Build the attachment message
        Message.AttachmentInfo info = new Message.AttachmentInfo();
        info.setStoredFilename(storedName);
        info.setOriginalFilename(sanitiseFilename(file.getOriginalFilename()));
        info.setContentType(file.getContentType());
        info.setSizeBytes(file.getSize());

        Message msg = new Message();
        msg.setConversationId(conversationId);
        msg.setBookingId(conv.getBookingId());
        msg.setSenderId(userId);
        msg.setSenderRole(role.toUpperCase());
        msg.setType(Message.MessageType.ATTACHMENT);
        msg.setAttachment(info);
        msg.setReadByCustomer("CUSTOMER".equalsIgnoreCase(role));
        msg.setReadByProvider("PROVIDER".equalsIgnoreCase(role));

        Message saved = messageRepo.save(msg);
        conversationService.updateLastMessage(conversationId, "📎 " + info.getOriginalFilename(), role);
        return saved;
    }

    // ── Download attachment ───────────────────────────────────────────────────

    public Path getAttachmentPath(String messageId, String userId, String role) {
        Message msg = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));

        if (msg.getAttachment() == null) {
            throw new ResourceNotFoundException("No attachment on this message.");
        }

        // Verify access to the parent conversation
        conversationService.getConversation(msg.getConversationId(), userId, role);

        Path filePath = Paths.get(attachmentsDir,
                msg.getConversationId(),
                msg.getAttachment().getStoredFilename());

        if (!Files.exists(filePath)) {
            throw new ResourceNotFoundException("Attachment file not found.");
        }
        return filePath;
    }

    public String getAttachmentContentType(String messageId) {
        Message msg = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        return msg.getAttachment() != null ? msg.getAttachment().getContentType() : "application/octet-stream";
    }

    public String getAttachmentOriginalName(String messageId) {
        Message msg = messageRepo.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found: " + messageId));
        return msg.getAttachment() != null ? msg.getAttachment().getOriginalFilename() : "file";
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidAttachmentException("No file provided.");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidAttachmentException(
                    "File too large. Maximum allowed size is 10 MB.");
        }
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_CONTENT_TYPES.contains(ct)) {
            throw new InvalidAttachmentException(
                    "Unsupported file type. Allowed types: images (JPEG, PNG, GIF, WebP), PDF, DOC, DOCX, TXT.");
        }
        String name = file.getOriginalFilename();
        if (name != null && (name.contains("..") || name.contains("/") || name.contains("\\"))) {
            throw new InvalidAttachmentException("Invalid filename.");
        }
    }

    private String storeFile(MultipartFile file, String conversationId) throws IOException {
        // Each conversation gets its own sub-directory — never expose raw paths
        Path dir = Paths.get(attachmentsDir, conversationId);
        Files.createDirectories(dir);

        String ext = "";
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            ext = original.substring(original.lastIndexOf('.'));
        }
        String storedName = UUID.randomUUID() + ext;
        Path dest = dir.resolve(storedName);
        file.transferTo(dest.toFile());
        return storedName;
    }

    private String sanitiseFilename(String filename) {
        if (filename == null) return "file";
        // Strip path separators and control characters
        return filename.replaceAll("[/\\\\:*?\"<>|]", "_")
                       .replaceAll("\\.\\.", "_")
                       .trim();
import java.time.Instant;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import com.clickcart.dto.messaging.MessageResponse;
import com.clickcart.dto.messaging.PagedMessagesResponse;
import com.clickcart.dto.messaging.SendMessageRequest;
import com.clickcart.exception.ResourceNotFoundException;
import com.clickcart.model.Conversation;
import com.clickcart.model.Message;
import com.clickcart.model.SenderRole;
import com.clickcart.repository.ConversationRepository;
import com.clickcart.repository.MessageRepository;

/**
 * Business logic for sending, fetching, and marking messages as read.
 *
 * <p><strong>Ownership enforcement:</strong> every method that accesses a specific
 * conversation delegates to {@link ConversationService#assertParticipant} before
 * performing any data access. A non-participant caller receives a {@code 403}.</p>
 *
 * <p><strong>Circular dependency:</strong> {@link ConversationService} injects this
 * service for the embedded-messages feature of {@code getConversation}.  To break
 * the cycle without restructuring, {@link ConversationService} is injected here
 * with {@code @Lazy} so Spring resolves the proxy after both beans are constructed.</p>
 *
 * <p><strong>Notification events:</strong> when a message is sent, a notification event
 * should be published to the Notification Center feature.  The stub method
 * {@link #publishMessageReceivedEvent} marks the integration point.
 * {@code TODO(DEV-notifications): replace stub with real NotificationEventPublisher once
 * the Notification Center team publishes the agreed event contract.}</p>
 */
@Service
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    /** Characters kept when building the last-message preview on the Conversation. */
    private static final int PREVIEW_MAX_LENGTH = 120;

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationService conversationService;

    /**
     * {@code @Lazy} on {@link ConversationService} breaks the
     * {@code ConversationService ↔ MessageService} circular dependency.
     */
    public MessageService(MessageRepository messageRepository,
                          ConversationRepository conversationRepository,
                          @Lazy ConversationService conversationService) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.conversationService = conversationService;
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Persists a new message, updates the conversation's preview fields and the
     * recipient's unread counter, and fires a notification event.
     *
     * <p>Steps performed:
     * <ol>
     *   <li>Load conversation — {@code 404} if missing.</li>
     *   <li>Ownership check — {@code 403} if caller is not a participant.</li>
     *   <li>Determine sender's role from the conversation document.</li>
     *   <li>Persist the {@link Message}.</li>
     *   <li>Update {@link Conversation}: {@code lastMessageText}, {@code lastMessageAt},
     *       and increment the <em>recipient's</em> unread counter.</li>
     *   <li>Publish a {@code MESSAGE_RECEIVED} notification event (stub).</li>
     * </ol>
     *
     * @param conversationId the conversation to send into
     * @param currentUserId  the authenticated sender's user ID
     * @param request        contains the message content (validated before this call)
     * @return the persisted message as a {@link MessageResponse}
     * @throws ResourceNotFoundException if the conversation does not exist
     * @throws com.clickcart.exception.AccessForbiddenException if the caller is not a participant
     */
    public MessageResponse sendMessage(String conversationId,
                                       String currentUserId,
                                       SendMessageRequest request) {
        Conversation conv = conversationService.findConversationById(conversationId);
        conversationService.assertParticipant(conv, currentUserId);

        SenderRole senderRole = conversationService.roleOf(conv, currentUserId);

        // Persist the message
        Message message = new Message(conversationId, currentUserId, senderRole, request.getContent());
        message = messageRepository.save(message);
        log.info("Message saved: id={}, conversationId={}, senderId={}", message.getId(), conversationId, currentUserId);

        // Update conversation preview and recipient's unread counter
        conv.setLastMessageText(truncatePreview(request.getContent()));
        conv.setLastMessageAt(message.getCreatedAt());
        incrementRecipientUnread(conv, senderRole);
        conversationRepository.save(conv);

        // Fire notification event (stub — wired up in DEV-notifications)
        publishMessageReceivedEvent(conv, currentUserId, senderRole, request.getContent());

        return toResponse(message);
    }

    /**
     * Returns a paginated slice of messages for a conversation, oldest-first.
     *
     * <p>Performs an ownership check before querying the {@code messages} collection.</p>
     *
     * @param conversationId the conversation whose messages to fetch
     * @param currentUserId  the authenticated user's ID
     * @param pageable       pagination parameters (page index and size)
     * @return a {@link PagedMessagesResponse} with {@code hasMore} derived from the slice
     * @throws ResourceNotFoundException if the conversation does not exist
     * @throws com.clickcart.exception.AccessForbiddenException if the caller is not a participant
     */
    public PagedMessagesResponse getMessages(String conversationId,
                                             String currentUserId,
                                             Pageable pageable) {
        Conversation conv = conversationService.findConversationById(conversationId);
        conversationService.assertParticipant(conv, currentUserId);

        Slice<Message> slice = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId, pageable);

        List<MessageResponse> responses = slice.getContent().stream()
                .map(this::toResponse)
                .toList();

        return new PagedMessagesResponse(
                responses,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                slice.hasNext()
        );
    }

    /**
     * Marks all unread messages in a conversation as read for the current caller.
     *
     * <p>Only messages sent by the <em>other</em> participant are marked; a sender's
     * own messages are never counted as unread for themselves.
     * After updating individual message documents the conversation's unread counter
     * for the caller is reset to {@code 0}.</p>
     *
     * <p>Steps performed:
     * <ol>
     *   <li>Ownership check.</li>
     *   <li>Batch-fetch unread messages where {@code senderId != currentUserId}.</li>
     *   <li>Set {@code readAt = now} on each and persist.</li>
     *   <li>Reset the caller's unread counter on the {@link Conversation}.</li>
     * </ol>
     *
     * @param conversationId the conversation to mark as read
     * @param currentUserId  the authenticated user's ID (their unread counter is reset)
     * @throws ResourceNotFoundException if the conversation does not exist
     * @throws com.clickcart.exception.AccessForbiddenException if the caller is not a participant
     */
    public void markAsRead(String conversationId, String currentUserId) {
        Conversation conv = conversationService.findConversationById(conversationId);
        conversationService.assertParticipant(conv, currentUserId);

        List<Message> unread = messageRepository
                .findUnreadMessagesForRecipient(conversationId, currentUserId);

        if (!unread.isEmpty()) {
            Instant now = Instant.now();
            unread.forEach(m -> m.setReadAt(now));
            messageRepository.saveAll(unread);
            log.info("Marked {} messages as read in conversationId={} for userId={}",
                    unread.size(), conversationId, currentUserId);
        }

        // Reset the caller's unread counter on the conversation
        SenderRole callerRole = conversationService.roleOf(conv, currentUserId);
        resetUnreadCounter(conv, callerRole);
        conversationRepository.save(conv);
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    /**
     * Increments the <em>recipient's</em> unread counter on the conversation.
     * If the sender is the CUSTOMER, the provider's counter is incremented, and vice-versa.
     */
    private void incrementRecipientUnread(Conversation conv, SenderRole senderRole) {
        if (senderRole == SenderRole.CUSTOMER) {
            conv.setProviderUnread(conv.getProviderUnread() + 1);
        } else {
            conv.setCustomerUnread(conv.getCustomerUnread() + 1);
        }
    }

    /**
     * Resets the unread counter for {@code callerRole} to {@code 0}.
     */
    private void resetUnreadCounter(Conversation conv, SenderRole callerRole) {
        if (callerRole == SenderRole.CUSTOMER) {
            conv.setCustomerUnread(0);
        } else {
            conv.setProviderUnread(0);
        }
    }

    /**
     * Truncates {@code content} to at most {@link #PREVIEW_MAX_LENGTH} characters,
     * appending an ellipsis if truncation occurred.
     */
    private String truncatePreview(String content) {
        if (content == null || content.length() <= PREVIEW_MAX_LENGTH) {
            return content;
        }
        return content.substring(0, PREVIEW_MAX_LENGTH - 3) + "...";
    }

    /**
     * Maps a {@link Message} document to a {@link MessageResponse} DTO.
     */
    private MessageResponse toResponse(Message message) {
        return new MessageResponse(
                message.getId(),
                message.getConversationId(),
                message.getSenderId(),
                message.getSenderRole(),
                message.getContent(),
                message.getReadAt(),
                message.getCreatedAt()
        );
    }

    /**
     * Stub for the notification event integration.
     *
     * <p>When the Notification Center feature (separate DEV ticket) publishes
     * the agreed {@code NotificationEvent} contract, replace this method body
     * with a call to the injected {@code NotificationEventPublisher}.
     *
     * <p>Agreed event fields (preliminary):
     * <ul>
     *   <li>{@code type}        — {@code "MESSAGE_RECEIVED"}</li>
     *   <li>{@code recipientId} — the other participant's user ID</li>
     *   <li>{@code payload.conversationId} — conversation ID</li>
     *   <li>{@code payload.preview}        — first 60 chars of the message</li>
     * </ul>
     *
     * {@code TODO(DEV-notifications): inject NotificationEventPublisher and call publish().}
     */
    private void publishMessageReceivedEvent(Conversation conv,
                                             String senderId,
                                             SenderRole senderRole,
                                             String content) {
        String recipientId = senderRole == SenderRole.CUSTOMER
                ? conv.getProviderId()
                : conv.getCustomerId();

        String preview = content.length() > 60 ? content.substring(0, 57) + "..." : content;

        // Stub — replace with real publisher when DEV-notifications is ready
        log.debug("Notification stub: MESSAGE_RECEIVED to recipientId={}, conversationId={}, preview={}",
                recipientId, conv.getId(), preview);
    }

    // -----------------------------------------------------------------------
    // Package-visible accessor (used by ConversationService tests)
    // -----------------------------------------------------------------------

    /**
     * Exposes the repository for use by service-layer tests without
     * requiring a full Spring context.
     */
    MessageRepository getMessageRepository() {
        return messageRepository;
    }
}
