package com.homestay.backend.repository;

import com.homestay.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByBookingId(Long bookingId);
    List<Review> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r")
    Double findAverageRating();
}