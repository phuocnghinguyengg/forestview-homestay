package com.homestay.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewSummaryResponse {
    private Double averageRating;
    private Long totalReviews;
}