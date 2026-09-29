package com.clickcart.repository;

import com.clickcart.model.Location;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends MongoRepository<Location, String> {
    
    // Case-insensitive regex search on the name field
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Location> findByNameContainingIgnoreCase(String name);
}
