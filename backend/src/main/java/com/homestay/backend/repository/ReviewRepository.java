package com.homestay.backend.repository;

import com.homestay.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    boolean existsByBookingId(Long bookingId);
    List<Review> findAllByOrderByCreatedAtDesc();
    List<Review> findByRoomIdOrderByCreatedAtDesc(Long roomId);
    List<Review> findByUserEmailOrderByCreatedAtDesc(String userEmail);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r")
    Double findAverageRating();

    @Query("SELECT r.booking.id FROM Review r WHERE r.booking.id IN :bookingIds")
    List<Long> findBookingIdsWithReview(@Param("bookingIds") List<Long> bookingIds);
}
