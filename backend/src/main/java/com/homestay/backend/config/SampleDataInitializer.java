package com.homestay.backend.config;

import com.homestay.backend.entity.*;
import com.homestay.backend.entity.enums.*;
import com.homestay.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** Opt-in reset for a clean demo database. ADMIN users are deliberately preserved. */
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.sample-data.reset-on-start", havingValue = "true")
public class SampleDataInitializer implements CommandLineRunner {
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final DiscountCodeRepository discountCodeRepository;
    private final HolidayRepository holidayRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override @Transactional
    public void run(String... args) {
        reviewRepository.deleteAll();
        bookingRepository.deleteAll();
        discountCodeRepository.deleteAll();
        holidayRepository.deleteAll();
        roomRepository.deleteAll();
        userRepository.deleteByRoleNot(Role.ADMIN);

        Room standard = room("Standard Pine", RoomType.STANDARD, 650000, 2, 24, "1 queen bed", "Nhìn ra vườn thông");
        Room superior = room("Superior Valley", RoomType.SUPERIOR, 850000, 2, 30, "1 king bed", "Toàn cảnh thung lũng");
        Room deluxe = room("Deluxe Fireplace", RoomType.DELUXE, 1150000, 3, 42, "1 king bed + sofa bed", "Ban công săn mây");
        Room suite = room("ForestView Suite", RoomType.SUITE, 1750000, 4, 58, "2 queen beds", "Góc rừng thông riêng tư");
        roomRepository.saveAll(List.of(standard, superior, deluxe, suite));

        holidayRepository.saveAll(List.of(
                Holiday.builder().date(LocalDate.of(2026, 12, 24)).name("Giáng sinh").build(),
                Holiday.builder().date(LocalDate.of(2027, 1, 1)).name("Tết Dương lịch").build()));
        discountCodeRepository.saveAll(List.of(
                DiscountCode.builder().code("WELCOME10").percent(10).description("Chào mừng khách mới").startAt(LocalDateTime.now().minusDays(1)).endAt(LocalDateTime.now().plusMonths(3)).active(true).build(),
                DiscountCode.builder().code("DALAT15").percent(15).description("Ưu đãi mùa thông xanh").startAt(LocalDateTime.now().minusDays(1)).endAt(LocalDateTime.now().plusMonths(1)).active(true).build()));

        User guest = userRepository.save(User.builder().fullName("Nguyễn Minh Anh").email("guest@forestview.vn")
                .password(passwordEncoder.encode("guest123")).phone("0901234567").emailVerified(true).enabled(true).role(Role.USER).membershipTier(MembershipTier.SILVER).build());
        Booking completed = bookingRepository.save(Booking.builder().user(guest).room(deluxe)
                .checkInDate(LocalDate.now().minusDays(12)).checkOutDate(LocalDate.now().minusDays(10)).guestCount(2).nights(2)
                .basePrice(BigDecimal.valueOf(2300000)).holidayPrice(BigDecimal.ZERO).extraGuestFee(BigDecimal.ZERO)
                .membershipDiscountPercent(10).membershipDiscountAmount(BigDecimal.valueOf(230000)).totalPrice(BigDecimal.valueOf(2070000))
                .status(BookingStatus.COMPLETED).paymentMethod(PaymentMethod.CARD).paymentStatus(PaymentStatus.PAID).bookingCode("FVDEMO01").build());
        reviewRepository.save(Review.builder().booking(completed).user(guest).room(deluxe).rating(5)
                .comment("Phòng đẹp, sạch và rất yên tĩnh. Ban công ngắm đồi thông thật sự đáng nhớ.").build());
    }

    private Room room(String name, RoomType type, long price, int maxGuests, int size, String beds, String view) {
        return Room.builder().name(name).type(type).description("Không gian ấm áp giữa rừng thông Đà Lạt, đầy đủ tiện nghi cho kỳ nghỉ chậm rãi.")
                .address("ForestView Homestay, Đà Lạt, Lâm Đồng").pricePerNight(BigDecimal.valueOf(price)).maxGuests(maxGuests)
                .recommendedGuests(Math.min(2, maxGuests)).extraGuestFee(BigDecimal.valueOf(150000)).weekendPrice(null).holidayPrice(null)
                .roomSize(size).bedConfiguration(beds).viewDescription(view).bathroomDescription("Phòng tắm riêng, nước nóng, đồ dùng cá nhân")
                .floor("Khu ForestView").checkInTime("14:00").checkOutTime("12:00").houseRules("Không hút thuốc trong phòng. Vui lòng giữ yên tĩnh sau 22:00.")
                .amenities(List.of("Wi‑Fi tốc độ cao", "Bữa sáng", "Nước nóng", "Chỗ đậu xe")).images(List.of()).active(true).build();
    }
}
