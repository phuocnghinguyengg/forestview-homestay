package com.homestay.backend.dto.response;

import com.homestay.backend.entity.enums.BookingStatus;
import com.homestay.backend.entity.enums.PaymentMethod;
import com.homestay.backend.entity.enums.PaymentStatus;
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
    private Integer nights;
    private Integer guestCount;
    private BigDecimal basePrice;
    private BigDecimal holidayPrice;
    private BigDecimal extraGuestFee;
    private Integer membershipDiscountPercent;
    private BigDecimal membershipDiscountAmount;
    private String discountCode;
    private Integer discountCodePercent;
    private BigDecimal discountCodeAmount;
    private BigDecimal totalPrice;
    private BookingStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private LocalDateTime paymentHoldExpiresAt;
    private String rejectionReason;
    private String note;
    private LocalDateTime createdAt;
    private String bookingCode;
    private Boolean hasReview;
}
