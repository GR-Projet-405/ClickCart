package com.clickcart.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import com.clickcart.repository.BookingRepository;
import com.clickcart.repository.ProviderProfileRepository;
import org.junit.jupiter.api.Test;

class AiSearchServiceTest {

    private final ProviderProfileRepository providerProfileRepository =
            org.mockito.Mockito.mock(ProviderProfileRepository.class);
    private final BookingRepository bookingRepository =
            org.mockito.Mockito.mock(BookingRepository.class);

    @Test
    void searchFallsBackToLocalSearchWhenGeminiKeyIsMissing() {
        when(providerProfileRepository.findByServiceCategoryContainingIgnoreCase("AC repair"))
                .thenReturn(List.of());
        when(providerProfileRepository.findAll()).thenReturn(List.of());

        AiSearchService service = new AiSearchService(providerProfileRepository, bookingRepository, "");

        var response = service.searchServices("AC repair");

        assertEquals(List.of(), response.getResults());
        assertEquals(List.of("AC Repair", "Cleaning", "Plumbing", "Beauty & Salon"), response.getCategories());
        verify(providerProfileRepository, times(2)).findAll();
    }
}
