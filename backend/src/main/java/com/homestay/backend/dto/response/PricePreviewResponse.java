package com.homestay.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Date-specific price before discounts so the client never has to guess seasonal pricing. */
@Data
@Builder
public class PricePreviewResponse {
    private LocalDate checkIn;
    private LocalDate checkOut;
    private int nights;
    private BigDecimal weekdaySubtotal;
    private BigDecimal weekendSubtotal;
    private BigDecimal holidaySubtotal;
    private int weekdayNights;
    private int weekendNights;
    private int holidayNights;
    private BigDecimal extraGuestSubtotal;
    private BigDecimal totalBeforeDiscount;
}
