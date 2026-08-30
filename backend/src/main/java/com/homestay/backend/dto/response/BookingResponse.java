package com.homestay.backend.dto.response;

import com.homestay.backend.entity.enums.*;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class BookingResponse {
    private Long id; private String bookingCode; private Long roomId; private String roomName; private String roomAddress;
    private String userFullName; private String userEmail; private LocalDate checkInDate; private LocalDate checkOutDate;
    private Integer guestCount; private Integer nights; private BigDecimal basePrice; private BigDecimal holidayPriceTotal;
    private BigDecimal extraGuestFee; private BigDecimal membershipDiscountAmount; private Integer membershipDiscountPercent;
    private MembershipTier membershipTierApplied; private BigDecimal totalPrice; private BookingStatus status;
    private PaymentMethod paymentMethod; private PaymentStatus paymentStatus; private LocalDateTime paymentHoldExpiresAt;
    private String rejectionReason; private String note; private LocalDateTime createdAt; private Boolean hasReview;
}
