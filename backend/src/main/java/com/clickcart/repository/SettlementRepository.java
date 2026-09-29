package com.clickcart.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.clickcart.model.Settlement;

public interface SettlementRepository extends MongoRepository<Settlement, String> {

    /** Count all settlements for a provider. */
    long countByProviderId(String providerId);

    /** Count by finance state (for auth-state aggregation). */
    long countByProviderIdAndFinanceState(String providerId, String financeState);

    /**
     * Full-text search across id, merchantRecipient, payoutMethod
     * plus optional financeState filter, paginated.
     */
    @Query("{ 'providerId': ?0, " +
           "$or: [ { '_id': { $regex: ?1, $options: 'i' } }, " +
                  "{ 'merchantRecipient': { $regex: ?1, $options: 'i' } }, " +
                  "{ 'payoutMethod': { $regex: ?1, $options: 'i' } } ] }")
    Page<Settlement> searchByProviderAndQuery(String providerId, String query, Pageable pageable);

    @Query("{ 'providerId': ?0, 'financeState': ?1, " +
           "$or: [ { '_id': { $regex: ?2, $options: 'i' } }, " +
                  "{ 'merchantRecipient': { $regex: ?2, $options: 'i' } }, " +
                  "{ 'payoutMethod': { $regex: ?2, $options: 'i' } } ] }")
    Page<Settlement> searchByProviderStateAndQuery(String providerId, String financeState, String query, Pageable pageable);

    /** All settlements for a provider ordered newest first (no text filter). */
    Page<Settlement> findByProviderIdOrderByCaptureDateDescIdDesc(String providerId, Pageable pageable);

    /** Filtered by financeState only. */
    Page<Settlement> findByProviderIdAndFinanceStateOrderByCaptureDateDescIdDesc(
            String providerId, String financeState, Pageable pageable);

    /** Sum amount, fee, net by state – used by summary aggregation. */
    List<Settlement> findByProviderIdAndFinanceStateIn(String providerId, List<String> states);
}
