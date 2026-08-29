package com.homestay.backend.controller;

import com.homestay.backend.dto.request.ForgotPasswordRequest;
import com.homestay.backend.dto.request.ResetPasswordRequest;
import com.homestay.backend.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/auth/password", "/api/auth"})
@RequiredArgsConstructor
public class PasswordController {
    private final AccountService accountService;

    @PostMapping({"/forgot", "/forgot-password"})
    public ResponseEntity<Void> forgot(@Valid @RequestBody ForgotPasswordRequest request) {
        accountService.forgotPassword(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping({"/reset", "/reset-password"})
    public ResponseEntity<Void> reset(@Valid @RequestBody ResetPasswordRequest request) {
        accountService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }
}
