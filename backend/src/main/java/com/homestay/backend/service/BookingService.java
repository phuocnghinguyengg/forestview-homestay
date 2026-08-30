package com.homestay.backend.service;

import com.homestay.backend.dto.request.BookingRequest;
import com.homestay.backend.dto.response.BookingResponse;
import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.Room;
import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.BookingStatus;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.BookingRepository;
import com.homestay.backend.repository.ReviewRepository;
import com.homestay.backend.repository.RoomRepository;
import com.homestay.backend.repository.UserRepository;
import com.homestay.backend.service.mapper.BookingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PricingService pricingService;
    private final ReviewRepository reviewRepository;

    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
        throw new IllegalArgumentException("Vui lòng xác thực email trước khi đặt phòng");
        }

        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
        throw new IllegalArgumentException("Check-out date must be after check-in date");
        }

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (!room.getActive()) {
            throw new IllegalArgumentException("Room is not available");
        }

        if (request.getGuestCount() > room.getMaxGuests()) {
            throw new IllegalArgumentException("Guest count exceeds room capacity");
        }

        List<Booking> overlapping = bookingRepository.findOverlappingBookings(
                room.getId(), request.getCheckInDate(), request.getCheckOutDate());

        if (!overlapping.isEmpty()) {
            throw new IllegalArgumentException("Room is already booked for the selected dates");
        }

        BigDecimal totalPrice = pricingService.calculateTotalPrice(
                room, request.getCheckInDate(), request.getCheckOutDate());

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .guestCount(request.getGuestCount())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .note(request.getNote())
                .build();

        Booking saved = bookingRepository.save(booking);
        saved.setBookingCode("FV" + String.format("%06d", saved.getId()));
        saved = bookingRepository.save(saved);

        emailService.sendBookingConfirmation(
                user.getEmail(), user.getFullName(), room.getName(),
                saved.getCheckInDate(), saved.getCheckOutDate(),
                saved.getGuestCount(), saved.getTotalPrice()
        );

        return BookingMapper.toResponse(saved, false);
    }

    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return bookingRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(b -> BookingMapper.toResponse(b, reviewRepository.existsByBookingId(b.getId())))
                .toList();
    }

    public BookingResponse getBookingForUser(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Bạn không có quyền xem đơn đặt phòng này");
        }

        return BookingMapper.toResponse(booking, reviewRepository.existsByBookingId(booking.getId()));
    }

    public void cancelBooking(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("You can only cancel your own booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Booking cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    // ---- Admin ----

    public List<BookingResponse> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(b -> BookingMapper.toResponse(b, reviewRepository.existsByBookingId(b.getId())))
                .toList();
    }

    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus status) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        booking.setStatus(status);
        Booking saved = bookingRepository.save(booking);
        return BookingMapper.toResponse(saved, reviewRepository.existsByBookingId(saved.getId()));
    }
}