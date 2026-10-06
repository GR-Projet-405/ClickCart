package com.clickcart.dto;

public record ProviderVerificationRequest(
    String accountType,
    String fullName,
    String nicNumber,
    String personalAddress,
    String contactNumber,
    String businessName,
    String brnNumber,
    String businessAddress,
    String businessContactNumber
) {}