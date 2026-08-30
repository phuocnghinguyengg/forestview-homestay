package com.homestay.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class AdminUserUpdateRequest {
    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    @Pattern(regexp = "^\\+[1-9]\\d{6,14}$", message = "Số điện thoại không hợp lệ")
    private String phone;
}