package com.homestay.backend.service;

import com.homestay.backend.dto.request.BookingRequest;
import com.homestay.backend.dto.response.BookingResponse;
import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.Room;
import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.*;
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

    @Transactional
    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        if (!request.getCheckOutDate().isAfter(request.getCheckInDate())) throw new IllegalArgumentException("Ngày trả phòng phải sau ngày nhận phòng");
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!Boolean.TRUE.equals(user.getEmailVerified())) throw new IllegalArgumentException("Vui lòng xác thực email trước khi đặt phòng");
        Room room = roomRepository.findById(request.getRoomId()).orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        if (!Boolean.TRUE.equals(room.getActive())) throw new IllegalArgumentException("Phòng không còn hoạt động");
        if (request.getGuestCount() > room.getMaxGuests()) throw new IllegalArgumentException("Số khách vượt quá sức chứa phòng");
        if (request.getPaymentMethod() == null) throw new IllegalArgumentException("Vui lòng chọn phương thức thanh toán");
        if (!bookingRepository.findOverlappingBookings(room.getId(), request.getCheckInDate(), request.getCheckOutDate()).isEmpty()) throw new IllegalArgumentException("Phòng đã được đặt trong khoảng ngày này");

        MembershipTier tier = user.getMembershipTier() == null ? MembershipTier.NONE : user.getMembershipTier();
        PricingService.PriceBreakdown price = pricingService.calculate(room, request.getCheckInDate(), request.getCheckOutDate(), request.getGuestCount(), tier.getDiscountPercent());
        PaymentMethod method = request.getPaymentMethod();
        boolean paid = method == PaymentMethod.CASH || method == PaymentMethod.QR_CODE || method == PaymentMethod.CARD;
        LocalDateTime holdUntil = method == PaymentMethod.HOLD ? LocalDateTime.now().plusHours(2) : null;

        Booking booking = Booking.builder().user(user).room(room).checkInDate(request.getCheckInDate()).checkOutDate(request.getCheckOutDate())
                .guestCount(request.getGuestCount()).nights(price.nights()).basePrice(price.basePrice()).holidayPriceTotal(price.holidayPriceTotal())
                .extraGuestFee(price.extraGuestFee()).membershipDiscountAmount(price.membershipDiscountAmount()).membershipDiscountPercent(tier.getDiscountPercent())
                .membershipTierApplied(tier).totalPrice(price.totalPrice()).paymentMethod(method).paymentStatus(paid ? PaymentStatus.PAID : PaymentStatus.HOLD)
                .paymentHoldExpiresAt(holdUntil).status(paid ? BookingStatus.CONFIRMED : BookingStatus.PENDING).note(request.getNote()).build();
        Booking saved = bookingRepository.save(booking);
        saved.setBookingCode("FV" + String.format("%06d", saved.getId()));
        saved = bookingRepository.save(saved);

        if (paid) {
            emailService.sendBookingPaidEmail(saved);
            membershipService.refreshTier(user);
        } else {
            emailService.sendBookingHoldEmail(saved);
        }
        return BookingMapper.toResponse(saved, false);
    }

    public List<BookingResponse> getMyBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return bookingRepository.findByUserOrderByCreatedAtDesc(user).stream().map(b -> BookingMapper.toResponse(b, reviewRepository.existsByBookingId(b.getId()))).toList();
    }

    public BookingResponse getBookingForUser(String userEmail, Long bookingId) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!b.getUser().getEmail().equalsIgnoreCase(userEmail)) throw new IllegalArgumentException("Bạn không có quyền xem đơn đặt phòng này");
        return BookingMapper.toResponse(b, reviewRepository.existsByBookingId(b.getId()));
    }

    @Transactional
    public void cancelBooking(String userEmail, Long bookingId) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        if (!b.getUser().getEmail().equalsIgnoreCase(userEmail)) throw new IllegalArgumentException("Bạn chỉ có thể hủy đơn của mình");
        if (b.getStatus() == BookingStatus.CANCELLED || b.getStatus() == BookingStatus.COMPLETED) throw new IllegalArgumentException("Đơn không thể hủy");
        b.setStatus(BookingStatus.CANCELLED); b.setPaymentStatus(PaymentStatus.UNPAID); b.setPaymentHoldExpiresAt(null); bookingRepository.save(b);
    }

    public List<BookingResponse> getAllBookings() {
        expirePaymentHolds();
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream().map(b -> BookingMapper.toResponse(b, reviewRepository.existsByBookingId(b.getId()))).toList();
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus status, String reason) {
        Booking b = bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        BookingStatus old = b.getStatus();
        if (status == BookingStatus.CANCELLED && old != BookingStatus.CANCELLED && (reason == null || reason.isBlank())) throw new IllegalArgumentException("Vui lòng nhập lý do từ chối");
        b.setStatus(status);
        if (status == BookingStatus.CONFIRMED) {
            b.setPaymentStatus(PaymentStatus.PAID);
            b.setPaymentHoldExpiresAt(null);
            b.setRejectionReason(null);
            emailService.sendBookingAdminConfirmedEmail(b);
            membershipService.refreshTier(b.getUser());
        } else if (status == BookingStatus.CANCELLED) {
            b.setPaymentStatus(PaymentStatus.UNPAID); b.setPaymentHoldExpiresAt(null); b.setRejectionReason(reason == null ? null : reason.trim());
            emailService.sendBookingRejectedEmail(b);
        }
        Booking saved = bookingRepository.save(b);
        return BookingMapper.toResponse(saved, reviewRepository.existsByBookingId(saved.getId()));
    }

    @Scheduled(fixedDelay = 300000)
    @Transactional
    public void expirePaymentHolds() {
        for (Booking b : bookingRepository.findExpiredPaymentHolds(LocalDateTime.now())) {
            b.setStatus(BookingStatus.CANCELLED); b.setPaymentStatus(PaymentStatus.UNPAID); b.setRejectionReason("Hết thời gian giữ chỗ 2 giờ");
            b.setPaymentHoldExpiresAt(null); bookingRepository.save(b); emailService.sendBookingHoldExpiredEmail(b);
        }
    }
}
