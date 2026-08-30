package com.homestay.backend.dto.response;

import com.homestay.backend.entity.enums.MembershipTier;
import com.homestay.backend.entity.enums.Role;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class UserResponse {
    private Long id; private String fullName; private String email; private String phone; private Role role;
    private Boolean enabled; private LocalDateTime createdAt; private Boolean emailVerified;
    private MembershipTier membershipTier; private String membershipLabel; private Integer membershipDiscountPercent;
    private long successfulBookingCount; private long successfulBookingTarget; private long successfulBookingProgressPercent;
    private long spendingVnd; private long spendingTargetVnd; private long spendingProgressPercent;
    private MembershipTier nextMembershipTier; private String nextMembershipLabel;
}
