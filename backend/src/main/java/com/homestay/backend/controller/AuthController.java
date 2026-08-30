package com.homestay.backend.controller;

import com.homestay.backend.dto.request.LoginRequest;
import com.homestay.backend.dto.request.OtpVerifyRequest;
import com.homestay.backend.dto.request.RegisterRequest;
import com.homestay.backend.dto.request.ResendOtpRequest;
import com.homestay.backend.dto.response.AuthResponse;
import com.homestay.backend.dto.response.RegisterResponse;
import com.homestay.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Void> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/skip-otp")
    public ResponseEntity<AuthResponse> skipOtp(@Valid @RequestBody ResendOtpRequest request) {
        return ResponseEntity.ok(authService.skipVerification(request));
    }
}