package com.homestay.backend.service;

import com.homestay.backend.entity.Holiday;
import com.homestay.backend.entity.Room;
import com.homestay.backend.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.MonthDay;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PricingService {
    private final HolidayRepository holidayRepository;

    /**
     * Tính giá theo từng đêm.
     * Thứ tự:
     * 1. Xác định giá từng đêm (giá lễ -> giá cuối tuần -> giá thường).
     * 2. Đại lễ Việt Nam nếu chưa có giá lễ riêng sẽ tự động x2 giá áp dụng.
     * 3. Cộng phụ thu khách vượt số khách đề xuất.
     * 4. Trừ discount membership trên toàn bộ subtotal.
     */
    public PriceBreakdown calculate(Room room, LocalDate checkIn, LocalDate checkOut,
                                    int guests, int membershipDiscountPercent) {
        if (checkIn == null || checkOut == null || !checkOut.isAfter(checkIn)) {
            throw new IllegalArgumentException("Ngày trả phòng phải sau ngày nhận phòng");
        }

        int nights = (int) java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut);

        Set<LocalDate> configuredHolidays = holidayRepository.findAll().stream()
                .map(Holiday::getDate)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());

        BigDecimal normalAndWeekendTotal = BigDecimal.ZERO;
        BigDecimal holidayTotal = BigDecimal.ZERO;
        BigDecimal automaticMajorHolidayTotal = BigDecimal.ZERO;

        LocalDate date = checkIn;
        while (date.isBefore(checkOut)) {
            boolean configuredHoliday = configuredHolidays.contains(date);
            boolean majorHoliday = isVietnamMajorHoliday(date);
            BigDecimal price = priceForDate(room, date, configuredHoliday, majorHoliday);

            if (configuredHoliday || majorHoliday) {
                holidayTotal = holidayTotal.add(price);
                if (majorHoliday && (room.getHolidayPrice() == null
                        || room.getHolidayPrice().compareTo(BigDecimal.ZERO) <= 0)) {
                    automaticMajorHolidayTotal = automaticMajorHolidayTotal.add(price);
                }
            } else {
                normalAndWeekendTotal = normalAndWeekendTotal.add(price);
            }
            date = date.plusDays(1);
        }

        // basePrice là tổng tiền phòng trước phụ thu và membership.
        BigDecimal base = normalAndWeekendTotal.add(holidayTotal);

        int recommended = room.getRecommendedGuests() == null
                ? Math.min(2, room.getMaxGuests())
                : room.getRecommendedGuests();
        int extraGuests = Math.max(0, guests - recommended);

        BigDecimal extra = room.getExtraGuestFeePerNight() == null
                ? BigDecimal.ZERO
                : room.getExtraGuestFeePerNight()
                    .multiply(BigDecimal.valueOf(extraGuests))
                    .multiply(BigDecimal.valueOf(nights));

        BigDecimal subtotal = base.add(extra);
        int discountPercent = Math.max(0, Math.min(100, membershipDiscountPercent));
        BigDecimal discount = subtotal
                .multiply(BigDecimal.valueOf(discountPercent))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.subtract(discount).max(BigDecimal.ZERO);

        return new PriceBreakdown(
                nights,
                base.setScale(2, RoundingMode.HALF_UP),
                holidayTotal.setScale(2, RoundingMode.HALF_UP),
                automaticMajorHolidayTotal.setScale(2, RoundingMode.HALF_UP),
                extra.setScale(2, RoundingMode.HALF_UP),
                discount.setScale(2, RoundingMode.HALF_UP),
                total.setScale(2, RoundingMode.HALF_UP)
        );
    }

    public BigDecimal calculateTotalPrice(Room room, LocalDate checkIn, LocalDate checkOut) {
        return calculate(room, checkIn, checkOut, 1, 0).totalPrice();
    }

    private BigDecimal priceForDate(Room room, LocalDate date,
                                    boolean configuredHoliday, boolean majorHoliday) {
        // Admin đã nhập giá lễ thì luôn ưu tiên giá lễ đó.
        if ((configuredHoliday || majorHoliday) && room.getHolidayPrice() != null
                && room.getHolidayPrice().compareTo(BigDecimal.ZERO) > 0) {
            return room.getHolidayPrice();
        }

        DayOfWeek dow = date.getDayOfWeek();
        boolean weekend = dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY;
        BigDecimal normalPrice = weekend && room.getWeekendPrice() != null
                ? room.getWeekendPrice()
                : room.getPricePerNight();

        // Đại lễ quốc gia Việt Nam: tự động x2 nếu admin chưa đặt holidayPrice.
        if (majorHoliday) {
            return normalPrice.multiply(BigDecimal.valueOf(2));
        }
        return normalPrice;
    }

    /**
     * Các đại lễ quốc gia dùng để tự động nhân đôi giá.
     * - 01/01: Tết Dương lịch
     * - Tết Nguyên Đán: 3 ngày đầu năm âm lịch (bảng ngày dương lịch theo năm)
     * - Giỗ Tổ Hùng Vương: 10/3 âm lịch (bảng ngày dương lịch theo năm)
     * - 30/04: Ngày Giải phóng miền Nam
     * - 01/05: Quốc tế Lao động
     * - 02/09: Quốc khánh
     *
     * Bảng âm lịch được chuẩn bị cho 2025-2035 để không cần thêm thư viện ngoài.
     * Các ngày cố định hoạt động tự động cho mọi năm.
     */
    private boolean isVietnamMajorHoliday(LocalDate date) {
        MonthDay md = MonthDay.from(date);
        if (md.equals(MonthDay.of(1, 1))
                || md.equals(MonthDay.of(4, 30))
                || md.equals(MonthDay.of(5, 1))
                || md.equals(MonthDay.of(9, 2))) {
            return true;
        }

        Set<LocalDate> lunarHolidayDates = LUNAR_MAJOR_HOLIDAY_DATES.get(date.getYear());
        return lunarHolidayDates != null && lunarHolidayDates.contains(date);
    }

    private static Set<LocalDate> lunarDates(int year, int tetMonth, int tetDay,
                                              int hungKingsMonth, int hungKingsDay) {
        Set<LocalDate> dates = new HashSet<>();
        // Tết: 3 ngày đầu năm âm lịch.
        LocalDate tet = LocalDate.of(year, tetMonth, tetDay);
        dates.add(tet);
        dates.add(tet.plusDays(1));
        dates.add(tet.plusDays(2));
        // Giỗ Tổ Hùng Vương (10/3 âm lịch) theo ngày dương lịch.
        dates.add(LocalDate.of(year, hungKingsMonth, hungKingsDay));
        return Set.copyOf(dates);
    }

    private static final Map<Integer, Set<LocalDate>> LUNAR_MAJOR_HOLIDAY_DATES = Map.ofEntries(
            Map.entry(2025, lunarDates(2025, 1, 29, 4, 7)),
            Map.entry(2026, lunarDates(2026, 2, 17, 4, 26)),
            Map.entry(2027, lunarDates(2027, 2, 6, 4, 16)),
            Map.entry(2028, lunarDates(2028, 1, 26, 4, 6)),
            Map.entry(2029, lunarDates(2029, 2, 13, 4, 25)),
            Map.entry(2030, lunarDates(2030, 2, 3, 4, 15)),
            Map.entry(2031, lunarDates(2031, 1, 23, 4, 4)),
            Map.entry(2032, lunarDates(2032, 2, 11, 4, 22)),
            Map.entry(2033, lunarDates(2033, 1, 31, 4, 12)),
            Map.entry(2034, lunarDates(2034, 2, 19, 4, 1)),
            Map.entry(2035, lunarDates(2035, 2, 8, 4, 19))
    );

    public record PriceBreakdown(
            int nights,
            BigDecimal basePrice,
            BigDecimal holidayPriceTotal,
            BigDecimal automaticMajorHolidayTotal,
            BigDecimal extraGuestFee,
            BigDecimal membershipDiscountAmount,
            BigDecimal totalPrice
    ) {}
}
