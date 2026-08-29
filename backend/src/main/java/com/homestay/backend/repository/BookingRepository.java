package com.homestay.backend.repository;

import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(User user);

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT b FROM Booking b
        WHERE b.room.id = :roomId
        AND b.status IN ('PENDING', 'CONFIRMED')
        AND b.checkInDate < :checkOutDate
        AND b.checkOutDate > :checkInDate
        """)
    List<Booking> findOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );

    long countByStatus(BookingStatus status);

    @Query("""
            SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b
            WHERE b.status IN ('CONFIRMED', 'COMPLETED')
            """)
    BigDecimal sumRevenue();
    @Query("""
            SELECT COALESCE(SUM(b.totalPrice), 0) FROM Booking b
            WHERE b.status IN ('CONFIRMED', 'COMPLETED')
            AND b.createdAt >= :from
            """)
    BigDecimal sumRevenueSince(@Param("from") LocalDateTime from);
}