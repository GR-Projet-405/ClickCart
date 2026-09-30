package com.clickcart.dto.messaging;

import java.time.Instant;

/**
 * A compact summary of a single conversation, used in list views.
 *
 * <p>This record is the response item returned by
 * {@code GET /api/conversations}. It contains enough information to render
 * a conversation row (avatar, name, message preview, unread badge, timestamp)
 * without requiring a secondary request into the messages collection.</p>
 *
 * <p>Fields are expressed from the perspective of the authenticated caller —
 * {@code otherPartyId} and {@code otherPartyName} refer to whoever is on the
 * opposite side of the conversation, regardless of whether the caller is a
 * customer or a provider.</p>
 *
 * @param id                the conversation document ID
 * @param otherPartyId      user ID of the other participant
 * @param otherPartyName    display name of the other participant
 * @param otherPartyAvatarUrl profile picture URL of the other participant, may be null
 * @param serviceId         optional service context; null if no service was linked
 * @param bookingId         optional booking context; null if no booking was linked
 * @param lastMessageText   truncated preview of the most recent message (≤ 120 chars); null if no messages yet
 * @param lastMessageAt     timestamp of the most recent message; null if no messages yet
 * @param unreadCount       number of messages in this conversation not yet read by the caller
 */
public record ConversationSummaryResponse(
        String id,
        String otherPartyId,
        String otherPartyName,
        String otherPartyAvatarUrl,
        String serviceId,
        String bookingId,
        String lastMessageText,
        Instant lastMessageAt,
        int unreadCount
) {}
