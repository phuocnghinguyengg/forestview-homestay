package com.homestay.backend.service;

import com.homestay.backend.dto.request.BookingRequest;
import com.homestay.backend.dto.response.BookingResponse;
import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.DiscountCode;
import com.homestay.backend.entity.Room;
import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.BookingStatus;
import com.homestay.backend.entity.enums.PaymentMethod;
import com.homestay.backend.entity.enums.PaymentStatus;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.BookingRepository;
import com.homestay.backend.repository.ReviewRepository;
import com.homestay.backend.repository.RoomRepository;
import com.homestay.backend.repository.UserRepository;
import com.homestay.backend.service.mapper.BookingMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private final MembershipService membershipService;
    private final DiscountCodeService discountCodeService;

    @Transactional
    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!Boolean.TRUE.equals(user.getEmailVerified())) throw new IllegalArgumentException("Vui lòng xác thực email trước khi đặt phòng");
        Room room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        if (!Boolean.TRUE.equals(room.getActive())) throw new IllegalArgumentException("Room is not available");
        if (request.getGuestCount() > room.getMaxGuests()) throw new IllegalArgumentException("Guest count exceeds room capacity");

        if (!bookingRepository.findOverlappingBookings(room.getId(), request.getCheckInDate(), request.getCheckOutDate()).isEmpty()) {
            throw new IllegalArgumentException("Room is already booked for the selected dates");
        }

        PricingService.PriceBreakdown price = pricingService.calculate(room, request.getCheckInDate(), request.getCheckOutDate());
        BigDecimal subtotal = price.basePrice().add(price.holidayPrice());
        int extraGuests = Math.max(0, request.getGuestCount() - (room.getRecommendedGuests() == null ? 0 : room.getRecommendedGuests()));
        BigDecimal extraFee = room.getExtraGuestFee() == null ? BigDecimal.ZERO : room.getExtraGuestFee().multiply(BigDecimal.valueOf(extraGuests)).multiply(BigDecimal.valueOf(price.nights()));
        BigDecimal beforeDiscount = subtotal.add(extraFee);

        String normalizedCode = request.getDiscountCode() == null ? null : request.getDiscountCode().trim();
        Integer discountCodePercent = null;
        BigDecimal discountCodeAmount = BigDecimal.ZERO;
        BigDecimal afterCoupon = beforeDiscount;
        if (normalizedCode != null && !normalizedCode.isBlank()) {
            DiscountCode discountCode = discountCodeService.getValidOrThrow(normalizedCode);
            discountCodePercent = discountCode.getPercent();
            discountCodeAmount = beforeDiscount.multiply(BigDecimal.valueOf(discountCodePercent)).divide(BigDecimal.valueOf(100));
            afterCoupon = beforeDiscount.subtract(discountCodeAmount);
            normalizedCode = discountCode.getCode();
        }

        int discountPercent = membershipService.discountPercent(user);
        BigDecimal discount = afterCoupon.multiply(BigDecimal.valueOf(discountPercent)).divide(BigDecimal.valueOf(100));
        BigDecimal total = afterCoupon.subtract(discount).max(BigDecimal.ZERO);

        PaymentMethod method = request.getPaymentMethod() == null ? PaymentMethod.HOLD : request.getPaymentMethod();
        boolean instant = method != PaymentMethod.HOLD;
        LocalDateTime holdExpires = instant ? null : LocalDateTime.now().plusHours(2);

        Booking booking = Booking.builder()
                .user(user).room(room).checkInDate(request.getCheckInDate()).checkOutDate(request.getCheckOutDate())
                .guestCount(request.getGuestCount()).nights(price.nights()).basePrice(price.basePrice()).holidayPrice(price.holidayPrice())
                .extraGuestFee(extraFee).membershipDiscountPercent(discountPercent).membershipDiscountAmount(discount)
                .discountCode(normalizedCode).discountCodePercent(discountCodePercent).discountCodeAmount(discountCodeAmount)
                .totalPrice(total).status(instant ? BookingStatus.CONFIRMED : BookingStatus.PENDING)
                .paymentMethod(method).paymentStatus(instant ? PaymentStatus.PAID : PaymentStatus.HOLD)
                .paymentHoldExpiresAt(holdExpires).note(request.getNote()).build();

        Booking saved = bookingRepository.save(booking);
        saved.setBookingCode("FV" + String.format("%06d", saved.getId()));
        saved = bookingRepository.save(saved);

        emailService.sendBookingConfirmation(user.getEmail(), user.getFullName(), room.getName(), saved.getCheckInDate(), saved.getCheckOutDate(), saved.getGuestCount(), saved.getTotalPrice(), instant ? "Đã xác nhận" : "Đang giữ chỗ - chờ xác nhận");
        if (instant) membershipService.refreshAfterConfirmedBooking(user);
        return BookingMapper.toResponse(saved, false);
    }

    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByUserOrderByCreatedAtDesc(user).stream().map(b -> BookingMapper.toResponse(b, reviewRepository.existsByBookingId(b.getId()))).toList();
    }

    public BookingResponse getBookingForUser(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getUser().getEmail().equals(userEmail)) throw new IllegalArgumentException("Bạn không có quyền xem đơn đặt phòng này");
        return BookingMapper.toResponse(booking, reviewRepository.existsByBookingId(booking.getId()));
    }

    public void cancelBooking(String userEmail, Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!booking.getUser().getEmail().equals(userEmail)) throw new IllegalArgumentException("You can only cancel your own booking");
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.COMPLETED) throw new IllegalArgumentException("Booking cannot be cancelled");
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setPaymentStatus(PaymentStatus.UNPAID);
        bookingRepository.save(booking);
    }

    public List<BookingResponse> getAllBookings() {
        expireHolds();
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(b -> BookingMapper.toResponse(b, reviewRepository.existsByBookingId(b.getId()))).toList();
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus status, String reason) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (status == BookingStatus.CANCELLED && (reason == null || reason.isBlank())) throw new IllegalArgumentException("Vui lòng nhập lý do từ chối");
        booking.setStatus(status);
        if (status == BookingStatus.CONFIRMED) {
            booking.setPaymentStatus(PaymentStatus.PAID);
            booking.setPaymentHoldExpiresAt(null);
            membershipService.refreshAfterConfirmedBooking(booking.getUser());
            emailService.sendBookingStatusEmail(booking.getUser().getEmail(), booking.getUser().getFullName(), booking.getRoom().getName(), "Đã xác nhận", null);
        } else if (status == BookingStatus.CANCELLED) {
            booking.setPaymentStatus(PaymentStatus.UNPAID);
            booking.setPaymentHoldExpiresAt(null);
            booking.setRejectionReason(reason);
            emailService.sendBookingStatusEmail(booking.getUser().getEmail(), booking.getUser().getFullName(), booking.getRoom().getName(), "Đã từ chối", reason);
        }
        Booking saved = bookingRepository.save(booking);
        return BookingMapper.toResponse(saved, reviewRepository.existsByBookingId(saved.getId()));
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expireHolds() {
        LocalDateTime now = LocalDateTime.now();
        bookingRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(b -> b.getStatus() == BookingStatus.PENDING && b.getPaymentHoldExpiresAt() != null && b.getPaymentHoldExpiresAt().isBefore(now))
                .forEach(b -> { b.setStatus(BookingStatus.CANCELLED); b.setPaymentStatus(PaymentStatus.UNPAID); b.setRejectionReason("Hết thời gian giữ chỗ 2 giờ"); bookingRepository.save(b); });
    }
}
