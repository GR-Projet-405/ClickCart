package com.clickcart.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.clickcart.model.Booking;

public interface BookingRepository extends MongoRepository<Booking, String> {
}
