package com.homestay.backend.service.mapper;

import com.homestay.backend.dto.response.BookingResponse;
import com.homestay.backend.entity.Booking;

public class BookingMapper {
    public static BookingResponse toResponse(Booking b, boolean hasReview) {
        return BookingResponse.builder()
                .id(b.getId()).bookingCode(b.getBookingCode()).roomId(b.getRoom().getId()).roomName(b.getRoom().getName())
                .roomAddress(b.getRoom().getAddress()).userFullName(b.getUser().getFullName()).userEmail(b.getUser().getEmail())
                .checkInDate(b.getCheckInDate()).checkOutDate(b.getCheckOutDate()).guestCount(b.getGuestCount())
                .nights(b.getNights()).basePrice(b.getBasePrice()).holidayPriceTotal(b.getHolidayPriceTotal())
                .extraGuestFee(b.getExtraGuestFee()).membershipDiscountAmount(b.getMembershipDiscountAmount())
                .membershipDiscountPercent(b.getMembershipDiscountPercent()).membershipTierApplied(b.getMembershipTierApplied())
                .totalPrice(b.getTotalPrice()).status(b.getStatus()).paymentMethod(b.getPaymentMethod()).paymentStatus(b.getPaymentStatus())
                .paymentHoldExpiresAt(b.getPaymentHoldExpiresAt()).rejectionReason(b.getRejectionReason()).note(b.getNote())
                .createdAt(b.getCreatedAt()).hasReview(hasReview).build();
    }
}
