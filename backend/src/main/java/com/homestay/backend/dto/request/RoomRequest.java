package com.homestay.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class RoomRequest {
    @NotBlank private String name;
    private String description;
    @NotBlank private String address;
    @NotNull @DecimalMin(value = "0.0", inclusive = false) private BigDecimal pricePerNight;
    @NotNull @Min(1) private Integer maxGuests;
    @Min(1) private Integer recommendedGuests;
    @DecimalMin(value = "0.0", inclusive = true) private BigDecimal extraGuestFeePerNight;
    private List<String> images;
    private List<String> amenities;
    @NotNull private com.homestay.backend.entity.enums.RoomType type;
    @DecimalMin(value = "0.0", inclusive = true) private BigDecimal weekendPrice;
    @DecimalMin(value = "0.0", inclusive = true) private BigDecimal holidayPrice;
}
