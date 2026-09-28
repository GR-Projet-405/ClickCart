package com.clickcart.exception;

public class ReviewNotFoundException extends RuntimeException {

    public ReviewNotFoundException(String reviewId) {
        super("Review not found: " + reviewId);
    }
}