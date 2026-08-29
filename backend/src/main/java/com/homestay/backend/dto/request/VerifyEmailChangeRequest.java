package com.homestay.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyEmailChangeRequest {
    @NotBlank @Email private String newEmail;
    @NotBlank private String otp;
}
