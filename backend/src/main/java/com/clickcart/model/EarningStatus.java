package com.clickcart.model;

/**
 * Lifecycle status of provider earnings.
 */
public enum EarningStatus {
    PENDING,     // In escrow / service in progress
    AVAILABLE,   // Cleared and ready for withdrawal / payout
    SETTLED,     // Paid out to provider bank account
    REFUNDED     // Reversed due to cancellation or dispute
}
