package com.homestay.backend.dto.response;

import com.homestay.backend.entity.enums.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private Long roomId;
    private String roomName;
    private String roomAddress;
    private String userFullName;
    private String userEmail;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guestCount;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private String note;
    private LocalDateTime createdAt;
    private String bookingCode;
    private Boolean hasReview;
}