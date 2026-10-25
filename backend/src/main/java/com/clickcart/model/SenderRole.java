package com.clickcart.model;

/**
 * Identifies which marketplace role sent a given {@link Message}.
 * Stored as a string literal in MongoDB for readability.
 */
public enum SenderRole {
    CUSTOMER,
    PROVIDER
}
