package com.clickcart.dto.messaging;

import java.time.Instant;

/**
 * Full detail of a conversation, including its first page of messages.
 *
 * <p>Returned by {@code GET /api/conversations/{id}}. The caller receives
 * the conversation metadata together with the most recent page of messages
 * so that the chat window can render without a second round-trip.</p>
 *
 * <p>Subsequent (older) message pages are fetched separately via
 * {@code GET /api/conversations/{id}/messages?page=N}.</p>
 *
 * @param id            the conversation document ID
 * @param customerId    ID of the customer participant
 * @param providerId    ID of the provider participant
 * @param serviceId     optional service context; null if none was set
 * @param bookingId     optional booking context; null if none was set
 * @param createdAt     when the conversation was first created
 * @param messages      first page of messages (oldest-first), may be empty if no messages yet
 */
public record ConversationDetailResponse(
        String id,
        String customerId,
        String providerId,
        String serviceId,
        String bookingId,
        Instant createdAt,
        PagedMessagesResponse messages
) {}
