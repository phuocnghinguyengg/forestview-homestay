package com.homestay.backend.service;

import com.homestay.backend.dto.response.DashboardStatsResponse;
import com.homestay.backend.entity.enums.BookingStatus;
import com.homestay.backend.repository.BookingRepository;
import com.homestay.backend.repository.RoomRepository;
import com.homestay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    public DashboardStatsResponse getStats() {
        Map<String, Long> byStatus = Arrays.stream(BookingStatus.values())
                .collect(Collectors.toMap(
                        Enum::name,
                        bookingRepository::countByStatus
                ));

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
}