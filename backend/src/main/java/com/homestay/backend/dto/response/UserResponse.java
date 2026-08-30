package com.homestay.backend.dto.response;

import com.homestay.backend.entity.enums.MembershipTier;
import com.homestay.backend.entity.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private Boolean enabled;
    private LocalDateTime createdAt;
    private Boolean emailVerified;
    private MembershipTier membershipTier;
    private long membershipBookingCount;
    private java.math.BigDecimal membershipTotalSpent;
    private int nextTierBookingThreshold;
    private long nextTierSpendingThreshold;
    private int membershipDiscountPercent;
}
