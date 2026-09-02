package com.homestay.backend.service;

import com.homestay.backend.entity.Holiday;
import com.homestay.backend.entity.Room;
import com.homestay.backend.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PricingService {
    private final HolidayRepository holidayRepository;

    public record PriceBreakdown(
            BigDecimal basePrice, BigDecimal holidayPrice, int nights,
            BigDecimal weekdayPrice, BigDecimal weekendPrice,
            int weekdayNights, int weekendNights, int holidayNights) {}

    public PriceBreakdown calculate(Room room, LocalDate checkIn, LocalDate checkOut) {
        Set<LocalDate> holidays = holidayRepository.findAll().stream()
                .map(Holiday::getDate)
                .collect(Collectors.toSet());
        holidays.addAll(VietnameseHolidayService.autoHolidayDatesBetween(checkIn, checkOut));

        BigDecimal normal = BigDecimal.ZERO;
        BigDecimal weekday = BigDecimal.ZERO;
        BigDecimal weekend = BigDecimal.ZERO;
        BigDecimal holiday = BigDecimal.ZERO;
        int nights = 0, weekdayNights = 0, weekendNights = 0, holidayNights = 0;
        for (LocalDate date = checkIn; date.isBefore(checkOut); date = date.plusDays(1)) {
            nights++;
            if (holidays.contains(date)) {
                holiday = holiday.add(holidayUnitPrice(room));
                holidayNights++;
            } else {
                BigDecimal unit = regularUnitPrice(room, date);
                normal = normal.add(unit);
                if (isWeekend(date)) { weekend = weekend.add(unit); weekendNights++; }
                else { weekday = weekday.add(unit); weekdayNights++; }
            }
        }
        return new PriceBreakdown(normal, holiday, nights, weekday, weekend, weekdayNights, weekendNights, holidayNights);
    }

    public BigDecimal calculateTotalPrice(Room room, LocalDate checkIn, LocalDate checkOut) {
        PriceBreakdown b = calculate(room, checkIn, checkOut);
        return b.basePrice().add(b.holidayPrice());
    }

    private BigDecimal holidayUnitPrice(Room room) {
        if (room.getHolidayPrice() != null && room.getHolidayPrice().compareTo(BigDecimal.ZERO) > 0) {
            return room.getHolidayPrice();
        }
        return room.getPricePerNight().multiply(BigDecimal.valueOf(2));
    }

    private static final BigDecimal WEEKEND_SURCHARGE = BigDecimal.valueOf(100_000);

    private BigDecimal regularUnitPrice(Room room, LocalDate date) {
        boolean weekend = isWeekend(date);
        if (!weekend) {
            return room.getPricePerNight();
        }
        if (room.getWeekendPrice() != null && room.getWeekendPrice().compareTo(BigDecimal.ZERO) > 0) {
            return room.getWeekendPrice();
        }
        return room.getPricePerNight().add(WEEKEND_SURCHARGE);
    }

    private boolean isWeekend(LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        return dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
    }
}
