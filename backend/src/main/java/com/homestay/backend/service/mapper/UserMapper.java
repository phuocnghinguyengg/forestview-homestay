package com.homestay.backend.service.mapper;

import com.homestay.backend.dto.response.UserResponse;
import com.homestay.backend.entity.User;

public class UserMapper {
    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .enabled(user.getEnabled())
                .createdAt(user.getCreatedAt())
                .emailVerified(user.getEmailVerified())
                .build();
    }
}