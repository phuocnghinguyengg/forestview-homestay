package com.homestay.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import com.homestay.backend.entity.enums.MembershipTier;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String fullName;
    private String email;
    private String role;
    private Long id;
    private String phone;
    private MembershipTier membershipTier;
    private String membershipLabel;
    private Integer membershipDiscountPercent;
    private Boolean emailVerified;
}