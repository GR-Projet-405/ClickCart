package com.clickcart.dto.messaging;

import java.util.List;

/**
 * A page of messages within a conversation.
 *
 * <p>Returned by {@code GET /api/conversations/{id}/messages?page=0&size=20}.
 * The {@code hasMore} flag allows the frontend to know whether a "load older
 * messages" control should be shown, without needing to know the total count.</p>
 *
 * <p>Messages are ordered oldest-first within the page so that a chat window
 * can append them in reading order.</p>
 *
 * @param messages list of message items for this page, ordered oldest-first
 * @param page     zero-based page index that was requested
 * @param size     number of items requested per page
 * @param hasMore  {@code true} if at least one more page exists after this one
 */
public record PagedMessagesResponse(
        List<MessageResponse> messages,
        int page,
        int size,
        boolean hasMore
) {}
