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
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;
import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.auth.cookie-same-site:Lax}")
    private String cookieSameSite;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpirationMs;

    @PostConstruct
    void validateCookieConfiguration() {
        if ("None".equalsIgnoreCase(cookieSameSite) && !cookieSecure) {
            throw new IllegalStateException("AUTH_COOKIE_SECURE must be true when AUTH_COOKIE_SAME_SITE=None");
        }
    }

    private long refreshCookieMaxAgeSeconds() {
        return Math.max(1, refreshTokenExpirationMs / 1000);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        return withRefreshCookie(authService.verifyOtp(request));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Void> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return withRefreshCookie(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = "refresh_token", required = false) String cookieToken) {
        AuthResponse response = authService.refresh(cookieToken);
        return withRefreshCookie(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite)
                .path("/api/auth").maxAge(0).build();
        return ResponseEntity.noContent().header("Set-Cookie", cookie.toString()).build();
    }

    private ResponseEntity<AuthResponse> withRefreshCookie(AuthResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", response.getRefreshToken())
                .httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite)
                .path("/api/auth").maxAge(refreshCookieMaxAgeSeconds()).build();
        // Do not expose the refresh token to browser JavaScript.
        response.setRefreshToken(null);
        return ResponseEntity.ok().header("Set-Cookie", cookie.toString()).body(response);
    }
}