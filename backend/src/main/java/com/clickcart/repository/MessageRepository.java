package com.clickcart.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.clickcart.model.Message;

/**
 * Spring Data MongoDB repository for {@link Message} documents.
 *
 * <p>All queries operate within the scope of a single conversation
 * (filtered by {@code conversationId}) to keep result sets bounded and
 * ensure the compound index {@code idx_conversation_createdat} is used.</p>
 *
 * <p>The {@code readAt} field is used as a null-means-unread marker.
 * Queries that check unread status filter on {@code readAt == null} and
 * exclude the current caller as sender so a user's own messages are
 * never counted as "unread for them".</p>
 */
@Repository
public interface MessageRepository extends MongoRepository<Message, String> {

    /**
     * Returns a page of messages belonging to the given conversation,
     * ordered oldest-first (ascending {@code createdAt}).
     *
     * <p>Backed by the compound index {@code { conversationId: 1, createdAt: 1 }}.
     * Use {@link Slice#hasNext()} to populate {@code hasMore} in the response DTO.</p>
     *
     * @param conversationId the conversation whose messages to load
     * @param pageable       pagination parameters; sort is applied from the index
     * @return a {@link Slice} of messages in chronological order
     */
    Slice<Message> findByConversationIdOrderByCreatedAtAsc(String conversationId, Pageable pageable);

    /**
     * Returns all unread messages in a conversation that were sent by someone
     * other than the current caller.
     *
     * <p>Used by the mark-as-read operation to batch-set {@code readAt} on the
     * returned documents. Filtering on {@code senderId != callerId} prevents a
     * user from marking their own outbound messages as "read".</p>
     *
     * <p>The {@code { '$exists': false }} check on {@code readAt} is equivalent
     * to {@code readAt == null} in MongoDB document terms.</p>
     *
     * @param conversationId the conversation to scan
     * @param senderId       the current caller's user ID (excluded from results)
     * @return list of unread message documents that need their {@code readAt} set
     */
    @Query("{ 'conversationId': ?0, 'senderId': { '$ne': ?1 }, 'readAt': { '$exists': false } }")
    List<Message> findUnreadMessagesForRecipient(String conversationId, String senderId);

    /**
     * Counts unread messages in a conversation sent by someone other than the caller.
     *
     * <p>Used to compute the accurate unread count after a mark-as-read operation
     * and to validate that the {@link com.clickcart.model.Conversation} unread
     * counter is in sync. Derives from the same filter as
     * {@link #findUnreadMessagesForRecipient}.</p>
     *
     * @param conversationId the conversation to count within
     * @param senderId       the current caller's user ID (excluded from count)
     * @return number of unread messages the caller has not yet read
     */
    long countByConversationIdAndReadAtIsNullAndSenderIdNot(String conversationId, String senderId);
}
