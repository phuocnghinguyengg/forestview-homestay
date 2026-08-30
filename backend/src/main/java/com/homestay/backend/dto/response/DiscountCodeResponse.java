package com.homestay.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class DiscountCodeResponse {
    private Long id;
    private String code;
    private Integer percent;
    private String description;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Boolean active;
    private LocalDateTime createdAt;
}
