package com.clickcart.service;

import com.clickcart.model.Favorite;
import com.clickcart.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    public Favorite addFavorite(String customerId, String targetType, String targetId) {
        Optional<Favorite> existing = favoriteRepository
            .findByCustomerIdAndTargetTypeAndTargetId(customerId, targetType, targetId);
        if (existing.isPresent()) {
            return existing.get();
        }
        Favorite favorite = new Favorite(customerId, targetType, targetId);
        return favoriteRepository.save(favorite);
    }

    public void removeFavorite(String customerId, String targetType, String targetId) {
        Optional<Favorite> existing = favoriteRepository
            .findByCustomerIdAndTargetTypeAndTargetId(customerId, targetType, targetId);
        existing.ifPresent(favoriteRepository::delete);
    }

    public List<Favorite> getCustomerFavorites(String customerId) {
        return favoriteRepository.findByCustomerId(customerId);
    }
}
