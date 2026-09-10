package com.homestay.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank
    private String email;

    public String getUsernameOrEmail() {
        return email;
    }

    public void setUsernameOrEmail(String val) {
        this.email = val;
    }

    @NotBlank
    private String password;
}