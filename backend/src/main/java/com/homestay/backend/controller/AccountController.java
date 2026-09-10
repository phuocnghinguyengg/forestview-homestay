package com.homestay.backend.controller;

import com.homestay.backend.dto.request.*;
import com.homestay.backend.dto.response.UserResponse;
import com.homestay.backend.dto.response.AuthResponse;
import com.homestay.backend.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.http.ResponseCookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @Value("${app.auth.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${app.auth.cookie-same-site:Lax}")
    private String cookieSameSite;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpirationMs;

    @GetMapping({"/account/me", "/users/me"})
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(accountService.getMe(user.getUsername()));
    }

    @PutMapping({"/account/profile", "/users/me"})
    public ResponseEntity<UserResponse> updateProfile(@AuthenticationPrincipal UserDetails user, @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(accountService.updateProfile(user.getUsername(), request));
    }

    @PutMapping({"/account/password", "/users/me/password"})
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetails user, @Valid @RequestBody ChangePasswordRequest request) {
        accountService.changePassword(user.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping({"/account/email/request", "/users/me/email/request"})
    public ResponseEntity<Void> requestEmailChange(@AuthenticationPrincipal UserDetails user, @Valid @RequestBody ChangeEmailRequest request) {
        accountService.requestEmailChange(user.getUsername(), request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping({"/account/email/verify", "/users/me/email/verify"})
    public ResponseEntity<UserResponse> verifyEmailChange(@AuthenticationPrincipal UserDetails user, @Valid @RequestBody VerifyEmailChangeRequest request) {
        AuthResponse response = accountService.verifyEmailChange(user.getUsername(), request);
        ResponseCookie cookie = ResponseCookie.from("refresh_token", response.getRefreshToken())
                .httpOnly(true).secure(cookieSecure).sameSite(cookieSameSite)
                .path("/api/auth").maxAge(Math.max(1, refreshTokenExpirationMs / 1000)).build();
        UserResponse profile = accountService.getMe(response.getEmail());
        return ResponseEntity.ok().header("Set-Cookie", cookie.toString()).body(profile);
    }
}
