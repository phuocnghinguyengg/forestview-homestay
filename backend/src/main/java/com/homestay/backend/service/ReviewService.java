package com.homestay.backend.service;

import com.homestay.backend.dto.request.ReviewRequest;
import com.homestay.backend.dto.response.ReviewResponse;
import com.homestay.backend.dto.response.ReviewSummaryResponse;
import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.Review;
import com.homestay.backend.entity.enums.BookingStatus;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.BookingRepository;
import com.homestay.backend.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    public ReviewResponse createReview(String userEmail, ReviewRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new IllegalArgumentException("Bạn chỉ có thể đánh giá đơn đặt phòng của mình");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new IllegalArgumentException("Chỉ có thể đánh giá sau khi đã hoàn tất kỳ nghỉ");
        }

        if (reviewRepository.existsByBookingId(booking.getId())) {
            throw new IllegalArgumentException("Bạn đã đánh giá đơn đặt phòng này rồi");
        }

        Review review = Review.builder()
                .booking(booking)
                .user(booking.getUser())
                .room(booking.getRoom())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        return toResponse(reviewRepository.save(review));
    }

    public List<ReviewResponse> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public ReviewSummaryResponse getSummary() {
        Double avg = reviewRepository.findAverageRating();
        long count = reviewRepository.count();
        return ReviewSummaryResponse.builder()
                .averageRating(avg == null ? 0.0 : Math.round(avg * 10) / 10.0)
                .totalReviews(count)
                .build();
    }

    private ReviewResponse toResponse(Review r) {
        return ReviewResponse.builder()
                .id(r.getId())
                .userFullName(r.getUser().getFullName())
                .roomName(r.getRoom().getName())
                .roomTypeLabel(r.getRoom().getType().getLabel())
                .rating(r.getRating())
                .comment(r.getComment())
                .createdAt(r.getCreatedAt())
                .build();
    }
}