package com.homestay.backend.repository;

import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository
        extends JpaRepository<Booking, Long> {

    List<Booking> findByUserOrderByCreatedAtDesc(
            User user
    );

    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("""
        SELECT b FROM Booking b
        WHERE b.room.id = :roomId
        AND b.status IN ('PENDING', 'CONFIRMED')
        AND (
            b.paymentHoldExpiresAt IS NULL
            OR b.paymentHoldExpiresAt > CURRENT_TIMESTAMP
        )
        AND b.checkInDate < :checkOutDate
        AND b.checkOutDate > :checkInDate
        """)
    List<Booking> findOverlappingBookings(
            @Param("roomId") Long roomId,
            @Param("checkInDate") LocalDate checkInDate,
            @Param("checkOutDate") LocalDate checkOutDate
    );

    long countByStatus(
            BookingStatus status
    );

    long countByUserAndStatusIn(
            User user,
            List<BookingStatus> statuses
    );

    @Query("""
            SELECT COALESCE(SUM(b.totalPrice), 0)
            FROM Booking b
            WHERE b.user = :user
            AND b.status IN ('CONFIRMED', 'COMPLETED')
            """)
    BigDecimal sumSpentByUser(
            @Param("user") User user
    );

    /*
     * DOANH THU:
     * Chỉ đơn đã HOÀN TẤT mới được tính doanh thu.
     */
    @Query("""
            SELECT COALESCE(SUM(b.totalPrice), 0)
            FROM Booking b
            WHERE b.status = 'COMPLETED'
            """)
    BigDecimal sumRevenue();

    @Query("""
            SELECT COALESCE(SUM(b.totalPrice), 0)
            FROM Booking b
            WHERE b.status = 'COMPLETED'
            AND b.createdAt >= :from
            """)
    BigDecimal sumRevenueSince(
            @Param("from") LocalDateTime from
    );

    List<Booking> findByStatusInAndCreatedAtAfter(
            List<BookingStatus> statuses,
            LocalDateTime from
    );
}