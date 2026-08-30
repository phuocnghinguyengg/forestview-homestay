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
                .guestCount(booking.getGuestCount())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .note(booking.getNote())
                .createdAt(booking.getCreatedAt())
                .hasReview(hasReview)
                .build();
    }
}