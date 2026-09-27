package com.clickcart.dto;

import java.math.BigDecimal;

import com.clickcart.model.ServiceListingStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ServiceListingRequest(
    @NotBlank @Size(max = 100) String title,
    @NotBlank @Size(max = 60) String category,
    @NotBlank @Size(max = 500) String description,
    @DecimalMin("0.0") BigDecimal priceFrom,
    @DecimalMin("0.0") BigDecimal priceTo,
    @Size(max = 40) String priceUnit,
    @Size(max = 2048) @Pattern(regexp = "(?i)^https?://\\S+$|^$", message = "Photo URL must use http or https") String imageUrl,
    ServiceListingStatus status
) {
    @AssertTrue(message = "The maximum price must be at least the minimum price")
    public boolean isPriceRangeValid() {
        return priceFrom == null && priceTo == null
            || priceFrom != null && priceTo != null && priceTo.compareTo(priceFrom) >= 0;
    }
}
