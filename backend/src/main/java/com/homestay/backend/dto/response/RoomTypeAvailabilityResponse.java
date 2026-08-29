package com.homestay.backend.dto.response;

import com.homestay.backend.entity.enums.RoomType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RoomTypeAvailabilityResponse {
    private RoomType type;
    private String label;
    private long totalRooms;
    private long availableRooms;
    private BigDecimal minPrice;
    private String coverImage;
}