package com.homestay.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
public class RevenuePointResponse {
    private String month;
    private BigDecimal revenue;
}