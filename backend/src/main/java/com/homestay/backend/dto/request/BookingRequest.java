package com.homestay.backend.dto.request;

import com.homestay.backend.entity.enums.PaymentMethod;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotNull private Long roomId;
    @NotNull @FutureOrPresent private LocalDate checkInDate;
    @NotNull @Future private LocalDate checkOutDate;
    @NotNull @Min(1) @Max(100) private Integer guestCount;
    private String note;
    @NotNull private PaymentMethod paymentMethod;
}
