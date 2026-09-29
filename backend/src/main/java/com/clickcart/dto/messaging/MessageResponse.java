package com.clickcart.dto.messaging;

import java.time.Instant;

import com.clickcart.model.SenderRole;

/**
 * Full representation of a single message, returned by send and list operations.
 *
 * <p>Used as the item type in {@link PagedMessagesResponse} and as the payload
 * broadcast over the WebSocket STOMP topic when a message is delivered in real time.</p>
 *
 * @param id             the message document ID
 * @param conversationId the conversation this message belongs to
 * @param senderId       user ID of the sender
 * @param senderRole     marketplace role of the sender ({@code CUSTOMER} or {@code PROVIDER})
 * @param content        the message text
 * @param readAt         timestamp when the recipient read this message; {@code null} means unread
 * @param createdAt      timestamp when this message was persisted
 */
public record MessageResponse(
        String id,
        String conversationId,
        String senderId,
        SenderRole senderRole,
        String content,
        Instant readAt,
        Instant createdAt
) {}
