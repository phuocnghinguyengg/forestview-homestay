package com.homestay.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DiscountCodeRequest {

    @NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "^[A-Za-z0-9_-]{3,50}$", message = "Mã giảm giá chỉ gồm chữ cái, số, gạch ngang hoặc gạch dưới (3-50 ký tự)")
    private String code;

    @NotNull @Min(1) @Max(100)
    private Integer percent;

    private String description;

    @NotNull
    private LocalDateTime startAt;

    @NotNull
    private LocalDateTime endAt;
}
