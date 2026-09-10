package com.homestay.backend.controller;

import com.homestay.backend.dto.response.DashboardStatsResponse;
import com.homestay.backend.dto.response.RevenuePointResponse;
import com.homestay.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/api/admin/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
    
    @GetMapping("/api/admin/dashboard/revenue-chart")
    public ResponseEntity<List<RevenuePointResponse>> getRevenueChart(
        @RequestParam(defaultValue = "6") int months) {
        if (months < 1 || months > 24) {
            throw new IllegalArgumentException("Số tháng phải nằm trong khoảng 1-24");
        }
        return ResponseEntity.ok(dashboardService.getRevenueChart(months));
    }
}