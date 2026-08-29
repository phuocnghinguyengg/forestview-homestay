package com.homestay.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class RoomRequest {
    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String address;

    @NotNull @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal pricePerNight;

    @NotNull @Min(1)
    private Integer maxGuests;

    private List<String> images;

    private List<String> amenities;
}