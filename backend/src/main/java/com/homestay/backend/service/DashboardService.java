package com.homestay.backend.service;

import com.homestay.backend.dto.response.DashboardStatsResponse;
import com.homestay.backend.dto.response.RevenuePointResponse;
import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.enums.BookingStatus;
import com.homestay.backend.repository.BookingRepository;
import com.homestay.backend.repository.RoomRepository;
import com.homestay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public DashboardStatsResponse getStats() {
        Map<String, Long> byStatus = Arrays.stream(BookingStatus.values())
                .collect(Collectors.toMap(Enum::name, bookingRepository::countByStatus));

        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        return DashboardStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalRooms(roomRepository.count())
                .activeRooms(roomRepository.countByActiveTrue())
                .totalBookings(bookingRepository.count())
                .bookingsByStatus(byStatus)
                .totalRevenue(bookingRepository.sumRevenue())
                .revenueThisMonth(bookingRepository.sumRevenueSince(startOfMonth))
                .build();
    }

    public List<RevenuePointResponse> getRevenueChart(int months) {
        LocalDate fromMonth = LocalDate.now().minusMonths(months - 1L).withDayOfMonth(1);
        LocalDateTime from = fromMonth.atStartOfDay();

        List<Booking> bookings = bookingRepository.findByStatusInAndCreatedAtAfter(
                List.of(BookingStatus.CONFIRMED, BookingStatus.COMPLETED), from);

        Map<YearMonth, BigDecimal> grouped = bookings.stream()
                .collect(Collectors.groupingBy(
                        b -> YearMonth.from(b.getCreatedAt()),
                        Collectors.reducing(BigDecimal.ZERO, Booking::getTotalPrice, BigDecimal::add)
                ));

        List<RevenuePointResponse> result = new ArrayList<>();
        DateTimeFormatter labelFmt = DateTimeFormatter.ofPattern("MM/yyyy");
        YearMonth cursor = YearMonth.from(fromMonth);
        YearMonth end = YearMonth.now();

        while (!cursor.isAfter(end)) {
            result.add(new RevenuePointResponse(
                    cursor.format(labelFmt),
                    grouped.getOrDefault(cursor, BigDecimal.ZERO)
            ));
            cursor = cursor.plusMonths(1);
        }

        return result;
    }
}