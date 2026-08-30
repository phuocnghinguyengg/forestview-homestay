package com.homestay.backend.dto.request;

import com.homestay.backend.entity.enums.MembershipTier;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminMembershipRequest {
    @NotNull
    private MembershipTier membershipTier;
}
