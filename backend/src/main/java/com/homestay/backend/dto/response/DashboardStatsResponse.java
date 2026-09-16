package com.homestay.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class DashboardStatsResponse {
    private long totalUsers;
    private long totalRooms;
    private long activeRooms;
    private long totalBookings;
    private Map<String, Long> bookingsByStatus;
    private BigDecimal totalRevenue;
    private BigDecimal revenueThisMonth;
}
