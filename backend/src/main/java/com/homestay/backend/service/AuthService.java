package com.homestay.backend.service;

import com.homestay.backend.dto.request.LoginRequest;
import com.homestay.backend.dto.request.OtpVerifyRequest;
import com.homestay.backend.dto.request.RegisterRequest;
import com.homestay.backend.dto.request.ResendOtpRequest;
import com.homestay.backend.dto.response.AuthResponse;
import com.homestay.backend.dto.response.RegisterResponse;
import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.Role;
import com.homestay.backend.repository.UserRepository;
import com.homestay.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final org.springframework.security.core.userdetails.UserDetailsService userDetailsService;
    private final EmailService emailService;

    private static final SecureRandom RANDOM = new SecureRandom();

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        String otp = generateOtp();

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.USER)
                .emailVerified(false)
                .otpCode(otp)
                .otpExpiresAt(LocalDateTime.now().plusMinutes(10))
                .build();

        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);

        return RegisterResponse.builder()
                .message("Vui lòng kiểm tra email để lấy mã xác thực")
                .email(user.getEmail())
                .build();
    }

    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Tài khoản đã được xác thực trước đó");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            throw new IllegalArgumentException("Mã OTP không đúng");
        }

        if (user.getOtpExpiresAt() == null || user.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Mã OTP đã hết hạn, vui lòng gửi lại mã mới");
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);

        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());

        return buildAuthResponse(user);
    }

    public AuthResponse skipVerification(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Tài khoản đã được xác thực trước đó");
        }

        // Cho phép đăng nhập tạm thời với trạng thái CHƯA xác thực.
        // Người dùng vẫn phải xác thực trước khi đặt phòng (kiểm tra ở BookingService).
        return buildAuthResponse(user);
    }

    public void resendOtp(ResendOtpRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản không tồn tại"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Tài khoản đã được xác thực trước đó");
        }

        String otp = generateOtp();
        user.setOtpCode(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), user.getFullName(), otp);
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails, user.getRole().name());
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .emailVerified(user.getEmailVerified())
                .membershipTier(user.getMembershipTier())
                .build();
    }

    private String generateOtp() {
        int otp = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(otp);
    }
}