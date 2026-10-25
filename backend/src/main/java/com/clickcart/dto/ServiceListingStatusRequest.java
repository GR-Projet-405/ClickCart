package com.clickcart.dto;

import com.clickcart.model.ServiceListingStatus;
import jakarta.validation.constraints.NotNull;

public record ServiceListingStatusRequest(@NotNull ServiceListingStatus status) {}
