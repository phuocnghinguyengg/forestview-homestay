package com.homestay.backend.entity;

import com.homestay.backend.entity.enums.BookingStatus;
import com.homestay.backend.entity.enums.MembershipTier;
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
@NoArgsConstructor @AllArgsConstructor @Builder
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false) private LocalDate checkInDate;
    @Column(nullable = false) private LocalDate checkOutDate;
    @Column(nullable = false) private Integer guestCount;
    @Column(nullable = false) private BigDecimal totalPrice;

    @Builder.Default private Integer nights = 1;
    @Builder.Default private BigDecimal basePrice = BigDecimal.ZERO;
    @Builder.Default private BigDecimal holidayPriceTotal = BigDecimal.ZERO;
    @Builder.Default private BigDecimal extraGuestFee = BigDecimal.ZERO;
    @Builder.Default private BigDecimal membershipDiscountAmount = BigDecimal.ZERO;
    @Builder.Default private Integer membershipDiscountPercent = 0;

    @Enumerated(EnumType.STRING) private MembershipTier membershipTierApplied;

    @Enumerated(EnumType.STRING)
    @Builder.Default private PaymentMethod paymentMethod = PaymentMethod.HOLD;

    @Enumerated(EnumType.STRING)
    @Builder.Default private PaymentStatus paymentStatus = PaymentStatus.HOLD;

    private LocalDateTime paymentHoldExpiresAt;
    @Column(columnDefinition = "TEXT") private String rejectionReason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default private BookingStatus status = BookingStatus.PENDING;

    @Column(columnDefinition = "TEXT") private String note;
    @Column(updatable = false) private LocalDateTime createdAt;
    @Column(unique = true) private String bookingCode;

    @PrePersist
    protected void onCreate() { this.createdAt = LocalDateTime.now(); }
}
