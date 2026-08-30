package com.homestay.backend.service.mapper;

import com.homestay.backend.dto.response.UserResponse;
import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.MembershipTier;
import com.homestay.backend.service.MembershipService;

public class UserMapper {
    public static UserResponse toResponse(User user) {
        return toResponse(user, null);
    }

    public static UserResponse toResponse(User user, MembershipService.MembershipProgress p) {
        MembershipTier tier = user.getMembershipTier() == null ? MembershipTier.NONE : user.getMembershipTier();
        return UserResponse.builder()
                .id(user.getId()).fullName(user.getFullName()).email(user.getEmail()).phone(user.getPhone()).role(user.getRole())
                .enabled(user.getEnabled()).createdAt(user.getCreatedAt()).emailVerified(user.getEmailVerified())
                .membershipTier(tier).membershipLabel(tier.getLabel()).membershipDiscountPercent(tier.getDiscountPercent())
                .successfulBookingCount(p == null ? 0 : p.bookingCount())
                .successfulBookingTarget(p == null ? tier.getBookingThreshold() : p.bookingTarget())
                .successfulBookingProgressPercent(p == null ? 0 : p.bookingProgressPercent())
                .spendingVnd(p == null ? 0 : p.spendingVnd())
                .spendingTargetVnd(p == null ? tier.getSpendingThreshold() : p.spendingTargetVnd())
                .spendingProgressPercent(p == null ? 0 : p.spendingProgressPercent())
                .nextMembershipTier(p == null ? null : p.nextTier())
                .nextMembershipLabel(p == null || p.nextTier() == null ? null : p.nextTier().getLabel())
                .build();
    }
}
