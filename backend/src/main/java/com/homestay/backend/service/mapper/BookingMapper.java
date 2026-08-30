package com.homestay.backend.service.mapper;

import com.homestay.backend.dto.response.BookingResponse;
import com.homestay.backend.entity.Booking;

public class BookingMapper {
    public static BookingResponse toResponse(Booking booking, boolean hasReview) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .roomId(booking.getRoom().getId())
                .roomName(booking.getRoom().getName())
                .roomAddress(booking.getRoom().getAddress())
                .userFullName(booking.getUser().getFullName())
                .userEmail(booking.getUser().getEmail())
                .checkInDate(booking.getCheckInDate())
                .checkOutDate(booking.getCheckOutDate())
                .nights(booking.getNights())
                .guestCount(booking.getGuestCount())
                .basePrice(booking.getBasePrice())
                .holidayPrice(booking.getHolidayPrice())
                .extraGuestFee(booking.getExtraGuestFee())
                .membershipDiscountPercent(booking.getMembershipDiscountPercent())
                .membershipDiscountAmount(booking.getMembershipDiscountAmount())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .paymentMethod(booking.getPaymentMethod())
                .paymentStatus(booking.getPaymentStatus())
                .paymentHoldExpiresAt(booking.getPaymentHoldExpiresAt())
                .rejectionReason(booking.getRejectionReason())
                .note(booking.getNote())
                .createdAt(booking.getCreatedAt())
                .hasReview(hasReview)
                .build();
    }
}
