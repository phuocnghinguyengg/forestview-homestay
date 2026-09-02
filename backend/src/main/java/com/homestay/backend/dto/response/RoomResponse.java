package com.homestay.backend.dto.response;

import com.homestay.backend.entity.enums.RoomType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RoomResponse {
    private Long id;
    private String name;
    private String description;
    private String address;
    private BigDecimal pricePerNight;
    private Integer maxGuests;
    private Integer recommendedGuests;
    private BigDecimal extraGuestFee;
    private List<String> images;
    private List<String> amenities;
    private Boolean active;
    private LocalDateTime createdAt;
    private RoomType type;
    private String typeLabel;
    private java.math.BigDecimal weekendPrice;
    private java.math.BigDecimal holidayPrice;
    private Integer roomSize;
    private String bedConfiguration;
    private String viewDescription;
    private String bathroomDescription;
    private String floor;
    private String checkInTime;
    private String checkOutTime;
    private String houseRules;
    /** Populated only for a date-specific availability search. */
    private java.math.BigDecimal quotedStayPrice;
}
