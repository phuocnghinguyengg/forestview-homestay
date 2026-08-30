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

    public BigDecimal calculateTotalPrice(Room room, LocalDate checkIn, LocalDate checkOut) {
        Set<LocalDate> holidays = holidayRepository.findAll().stream()
                .map(Holiday::getDate)
                .collect(Collectors.toSet());

        BigDecimal total = BigDecimal.ZERO;
        LocalDate date = checkIn;
        while (date.isBefore(checkOut)) {
            total = total.add(priceForDate(room, date, holidays));
            date = date.plusDays(1);
        }
        return total;
    }

    private BigDecimal priceForDate(Room room, LocalDate date, Set<LocalDate> holidays) {
        if (holidays.contains(date) && room.getHolidayPrice() != null) {
            return room.getHolidayPrice();
        }
        DayOfWeek dow = date.getDayOfWeek();
        boolean isWeekend = dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY;
        if (isWeekend && room.getWeekendPrice() != null) {
            return room.getWeekendPrice();
        }
        return room.getPricePerNight();
    }
}