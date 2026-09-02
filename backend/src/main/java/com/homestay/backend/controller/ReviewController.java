package com.homestay.backend.controller;

import com.homestay.backend.dto.request.ReviewRequest;
import com.homestay.backend.dto.response.ReviewResponse;
import com.homestay.backend.dto.response.ReviewSummaryResponse;
import com.homestay.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.createReview(userDetails.getUsername(), request));
    }

    @GetMapping
    public ResponseEntity<List<ReviewResponse>> getAll() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @GetMapping("/summary")
    public ResponseEntity<ReviewSummaryResponse> getSummary() {
        return ResponseEntity.ok(reviewService.getSummary());
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ReviewResponse>> getForRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(reviewService.getReviewsForRoom(roomId));
    }

}
