package com.homestay.backend.dto.response;

import lombok.AllArgsConstructor;
import com.homestay.backend.entity.enums.MembershipTier;
import lombok.Builder;
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
    private Boolean emailVerified;
    private MembershipTier membershipTier;
}