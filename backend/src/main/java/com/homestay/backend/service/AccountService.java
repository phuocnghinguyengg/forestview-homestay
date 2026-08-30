package com.homestay.backend.service;

import com.homestay.backend.dto.request.*;
import com.homestay.backend.dto.response.UserResponse;
import com.homestay.backend.dto.response.AuthResponse;
import com.homestay.backend.security.JwtService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.homestay.backend.entity.User;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.UserRepository;
import com.homestay.backend.service.mapper.UserMapper;
import com.homestay.backend.entity.enums.MembershipTier;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final MembershipService membershipService;
    private static final SecureRandom RANDOM = new SecureRandom();

    private User user(String email) { return userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found")); }
    private String otp() { return String.valueOf(100000 + RANDOM.nextInt(900000)); }

    public UserResponse getMe(String email) {
        User u = user(email);
        membershipService.refreshAfterConfirmedBooking(u);
        return profile(u);
    }

    private UserResponse profile(User u) {
        MembershipTier tier = u.getMembershipTier() == null ? MembershipTier.NONE : u.getMembershipTier();
        MembershipTier next = membershipService.nextTier(u);
        return UserResponse.builder()
                .id(u.getId()).fullName(u.getFullName()).email(u.getEmail()).phone(u.getPhone()).role(u.getRole())
                .enabled(u.getEnabled()).createdAt(u.getCreatedAt()).emailVerified(u.getEmailVerified())
                .membershipTier(tier).membershipBookingCount(membershipService.bookingCount(u))
                .membershipTotalSpent(membershipService.totalSpent(u))
                .nextTierBookingThreshold(next == null ? tier.getBookingThreshold() : next.getBookingThreshold())
                .nextTierSpendingThreshold(next == null ? tier.getSpendingThreshold() : next.getSpendingThreshold())
                .membershipDiscountPercent(tier.getDiscountPercent()).build();
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest r) {
        User u = user(email); u.setFullName(r.getFullName().trim()); u.setPhone(r.getPhone()); return profile(userRepository.save(u));
    }

    public void changePassword(String email, ChangePasswordRequest r) {
        User u = user(email);
        if (!passwordEncoder.matches(r.getCurrentPassword(), u.getPassword())) throw new IllegalArgumentException("Mật khẩu hiện tại không đúng");
        if (passwordEncoder.matches(r.getNewPassword(), u.getPassword())) throw new IllegalArgumentException("Mật khẩu mới phải khác mật khẩu hiện tại");
        u.setPassword(passwordEncoder.encode(r.getNewPassword())); userRepository.save(u);
    }

    public void requestEmailChange(String currentEmail, ChangeEmailRequest r) {
        User u = user(currentEmail); String next = r.getNewEmail().trim().toLowerCase();
        if (next.equalsIgnoreCase(u.getEmail())) throw new IllegalArgumentException("Email mới phải khác email hiện tại");
        if (userRepository.existsByEmail(next)) throw new IllegalArgumentException("Email này đã được sử dụng");
        String code = otp(); u.setPendingEmail(next); u.setEmailChangeOtp(code); u.setEmailChangeOtpExpiresAt(LocalDateTime.now().plusMinutes(10)); userRepository.save(u);
        emailService.sendOtpEmail(next, u.getFullName(), code);
    }

    public AuthResponse verifyEmailChange(String currentEmail, VerifyEmailChangeRequest r) {
        User u = user(currentEmail); String next = r.getNewEmail().trim().toLowerCase();
        if (u.getPendingEmail() == null || !u.getPendingEmail().equalsIgnoreCase(next)) throw new IllegalArgumentException("Yêu cầu đổi email không hợp lệ");
        if (u.getEmailChangeOtp() == null || !u.getEmailChangeOtp().equals(r.getOtp())) throw new IllegalArgumentException("Mã OTP không đúng");
        if (u.getEmailChangeOtpExpiresAt() == null || u.getEmailChangeOtpExpiresAt().isBefore(LocalDateTime.now())) throw new IllegalArgumentException("Mã OTP đã hết hạn");
        if (userRepository.existsByEmail(next)) throw new IllegalArgumentException("Email này đã được sử dụng");
        u.setEmail(next); u.setPendingEmail(null); u.setEmailChangeOtp(null); u.setEmailChangeOtpExpiresAt(null); u.setEmailVerified(true);
        User saved = userRepository.save(u);
        UserDetails details = userDetailsService.loadUserByUsername(saved.getEmail());
        return AuthResponse.builder()
                .accessToken(jwtService.generateAccessToken(details, saved.getRole().name()))
                .refreshToken(jwtService.generateRefreshToken(details))
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole().name())
                .id(saved.getId())
                .phone(saved.getPhone())
                .build();
    }

    public void forgotPassword(ForgotPasswordRequest r) {
        userRepository.findByEmail(r.getEmail().trim().toLowerCase()).ifPresent(u -> {
            String code = otp(); u.setResetOtpCode(code); u.setResetOtpExpiresAt(LocalDateTime.now().plusMinutes(10)); userRepository.save(u); emailService.sendPasswordResetOtpEmail(u.getEmail(), u.getFullName(), code);
        });
    }

    public void resetPassword(ResetPasswordRequest r) {
        User u = userRepository.findByEmail(r.getEmail().trim().toLowerCase()).orElseThrow(() -> new IllegalArgumentException("Email hoặc mã OTP không hợp lệ"));
        if (u.getResetOtpCode() == null || !u.getResetOtpCode().equals(r.getOtp())) throw new IllegalArgumentException("Mã OTP không đúng");
        if (u.getResetOtpExpiresAt() == null || u.getResetOtpExpiresAt().isBefore(LocalDateTime.now())) throw new IllegalArgumentException("Mã OTP đã hết hạn");
        u.setPassword(passwordEncoder.encode(r.getNewPassword())); u.setResetOtpCode(null); u.setResetOtpExpiresAt(null); userRepository.save(u);
    }
}
