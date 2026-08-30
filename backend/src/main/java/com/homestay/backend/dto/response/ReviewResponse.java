package com.homestay.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private String userFullName;
    private String roomName;
    private String roomTypeLabel;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}