package com.clickcart.repository;

import com.clickcart.model.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends MongoRepository<Favorite, String> {

    List<Favorite> findByCustomerId(String customerId);

    Optional<Favorite> findByCustomerIdAndTargetTypeAndTargetId(
        String customerId, String targetType, String targetId
    );

    Optional<Favorite> findByTargetTypeAndTargetId(String targetType, String targetId);
}
