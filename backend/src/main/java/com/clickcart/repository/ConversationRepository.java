package com.clickcart.repository;

import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.clickcart.model.Conversation;

/**
 * Spring Data MongoDB repository for {@link Conversation} documents.
 *
 * <p>Query methods are derived from the field names declared in
 * {@link Conversation} and map directly to the indexes defined on
 * the {@code conversations} collection:</p>
 * <ul>
 *   <li>{@code idx_customer_lastmsg} — used by {@link #findByCustomerIdOrderByLastMessageAtDesc}</li>
 *   <li>{@code idx_provider_lastmsg} — used by {@link #findByProviderIdOrderByLastMessageAtDesc}</li>
 *   <li>{@code idx_customer_provider_unique} — used by {@link #findByCustomerIdAndProviderId}</li>
 * </ul>
 *
 * <p>{@link Slice} is preferred over {@link org.springframework.data.domain.Page Page} for list
 * queries because it avoids an extra {@code count()} round-trip to MongoDB.
 * The service layer derives {@code hasMore} from whether the returned slice has a next page.</p>
 */
@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    /**
     * Returns a page of conversations in which the given user is the customer,
     * ordered by most-recently-messaged first.
     *
     * <p>Backed by the compound index {@code { customerId: 1, lastMessageAt: -1 }}.</p>
     *
     * @param customerId the customer participant's user ID
     * @param pageable   pagination and sort parameters (sort is applied from the index)
     * @return a {@link Slice} of conversations; use {@link Slice#hasNext()} for {@code hasMore}
     */
    Slice<Conversation> findByCustomerIdOrderByLastMessageAtDesc(String customerId, Pageable pageable);

    /**
     * Returns a page of conversations in which the given user is the provider,
     * ordered by most-recently-messaged first.
     *
     * <p>Backed by the compound index {@code { providerId: 1, lastMessageAt: -1 }}.</p>
     *
     * @param providerId the provider participant's user ID
     * @param pageable   pagination and sort parameters
     * @return a {@link Slice} of conversations
     */
    Slice<Conversation> findByProviderIdOrderByLastMessageAtDesc(String providerId, Pageable pageable);

    /**
     * Looks up the single conversation shared by a specific customer–provider pair.
     *
     * <p>Backed by the unique compound index {@code { customerId: 1, providerId: 1 }}.
     * Returns {@link Optional#empty()} when no conversation exists yet; the service
     * layer creates one in that case.</p>
     *
     * @param customerId the customer participant's user ID
     * @param providerId the provider participant's user ID
     * @return the existing conversation, or empty if none
     */
    Optional<Conversation> findByCustomerIdAndProviderId(String customerId, String providerId);
}
