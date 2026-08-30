package com.homestay.backend.entity;

import com.homestay.backend.entity.enums.BookingStatus;
import com.homestay.backend.entity.enums.PaymentMethod;
import com.homestay.backend.entity.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private LocalDate checkInDate;

    @Column(nullable = false)
    private LocalDate checkOutDate;

    @Column(nullable = false)
    private Integer guestCount;

    @Column(nullable = false)
    private BigDecimal totalPrice;

    @Column
    @Builder.Default
    private Integer nights = 1;

    private BigDecimal basePrice;
    private BigDecimal holidayPrice;
    private BigDecimal extraGuestFee;
    private Integer membershipDiscountPercent;
    private BigDecimal membershipDiscountAmount;

    private String discountCode;
    private Integer discountCodePercent;
    private BigDecimal discountCodeAmount;

    @Enumerated(EnumType.STRING)
    @Column
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.HOLD;

    @Enumerated(EnumType.STRING)
    @Column
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.HOLD;

    private LocalDateTime paymentHoldExpiresAt;
    private String rejectionReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    private String note;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(unique = true)
    private String bookingCode;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}