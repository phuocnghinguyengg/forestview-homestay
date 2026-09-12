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
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
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
    private final OtpRateLimiterService otpRateLimiterService;

    private static final SecureRandom RANDOM =
            new SecureRandom();

    @Transactional
    public RegisterResponse register(
            RegisterRequest request
    ) {
        String fullName =
                request.getFullName() == null
                        ? ""
                        : request.getFullName().trim();

        String email =
                request.getEmail() == null
                        ? ""
                        : request.getEmail()
                            .trim()
                            .toLowerCase();

        if (fullName.isBlank()) {
            throw new IllegalArgumentException(
                    "Vui lòng nhập họ và tên"
            );
        }

        if (email.isBlank()) {
            throw new IllegalArgumentException(
                    "Vui lòng nhập email"
            );
        }

        if (userRepository
                .existsByEmailIgnoreCase(email)) {

            throw new IllegalArgumentException(
                    "Email này đã được đăng ký"
            );
        }

        String username = request.getUsername() == null ? null : request.getUsername().trim().toLowerCase();
        if (username != null && !username.isBlank()) {
            if (!username.matches("^[a-zA-Z0-9_.-]{3,30}$")) {
                throw new IllegalArgumentException("Tên đăng nhập từ 3-30 ký tự, chỉ gồm chữ cái, số, dấu chấm hoặc gạch dưới");
            }
            if (userRepository.existsByUsernameIgnoreCase(username) || userRepository.existsByEmailIgnoreCase(username)) {
                throw new IllegalArgumentException("Tên đăng nhập này đã được sử dụng");
            }
        } else {
            username = null;
        }

        String otp = generateOtp();

        User user = User.builder()
                .fullName(fullName)
                .username(username)
                .email(email)
                .password(
                        passwordEncoder.encode(
                                request.getPassword()
                        )
                )
                .phone(request.getPhone())
                .role(Role.USER)
                .emailVerified(false)
                .otpCode(otp)
                .otpExpiresAt(
                        LocalDateTime.now()
                                .plusMinutes(10)
                )
                .build();

        userRepository.save(user);

        emailService.sendOtpEmail(
                user.getEmail(),
                user.getFullName(),
                otp
        );

        return RegisterResponse.builder()
                .message(
                        "Vui lòng kiểm tra email để lấy mã xác thực"
                )
                .email(user.getEmail())
                .build();
    }

    @Transactional
    public AuthResponse verifyOtp(
            OtpVerifyRequest request
    ) {
        String email = normalizeEmail(request.getEmail());

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Tài khoản không tồn tại"
                                )
                        );

        if (Boolean.TRUE.equals(
                user.getEmailVerified())) {

            throw new IllegalArgumentException(
                    "Tài khoản đã được xác thực trước đó"
            );
        }

        if (user.getOtpCode() == null ||
                !MessageDigest.isEqual(
                        user.getOtpCode().getBytes(StandardCharsets.UTF_8),
                        request.getOtp().getBytes(StandardCharsets.UTF_8))) {

            throw new IllegalArgumentException(
                    "Mã OTP không đúng"
            );
        }

        if (user.getOtpExpiresAt() == null ||
                user.getOtpExpiresAt()
                        .isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Mã OTP đã hết hạn, vui lòng gửi lại mã mới"
            );
        }

        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiresAt(null);

        userRepository.save(user);

        emailService.sendWelcomeEmail(
                user.getEmail(),
                user.getFullName()
        );

        return buildAuthResponse(user);
    }

    @Transactional
    public void resendOtp(
            ResendOtpRequest request
    ) {
        String email = normalizeEmail(request.getEmail());

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Tài khoản không tồn tại"
                                )
                        );

        if (Boolean.TRUE.equals(
                user.getEmailVerified())) {

            throw new IllegalArgumentException(
                    "Tài khoản đã được xác thực trước đó"
            );
        }

        otpRateLimiterService.checkAndRecord("resend-otp:" + email);

        String otp = generateOtp();

        user.setOtpCode(otp);

        user.setOtpExpiresAt(
                LocalDateTime.now()
                        .plusMinutes(10)
        );

        userRepository.save(user);

        emailService.sendOtpEmail(
                user.getEmail(),
                user.getFullName(),
                otp
        );
    }

    public AuthResponse login(
            LoginRequest request
    ) {
        String identifier = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new IllegalArgumentException("Tên đăng nhập/email hoặc mật khẩu không đúng"));

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            user.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new IllegalArgumentException(
                    "Tên đăng nhập/email hoặc mật khẩu không đúng"
            );
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("Vui lòng xác thực email trước khi đăng nhập");
        }

        return buildAuthResponse(user);
    }

    /**
     * Exchanges a still-valid refresh token for a fresh access token
     * (and a rotated refresh token). Rejects access tokens and expired
     * or tampered refresh tokens alike.
     */
    public AuthResponse refresh(
            String refreshToken
    ) {
        String email =
                jwtService.extractEmailIfValidRefreshToken(refreshToken);

        if (email == null) {
            throw new IllegalArgumentException(
                    "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
            );
        }

        User user =
                userRepository
                        .findByEmail(email)
                        .orElseThrow(
                                () -> new IllegalArgumentException(
                                        "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại"
                                )
                        );

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new IllegalArgumentException(
                    "Tài khoản đã bị vô hiệu hóa"
            );
        }

        return buildAuthResponse(user);
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private AuthResponse buildAuthResponse(
            User user
    ) {
        UserDetails userDetails =
                userDetailsService
                        .loadUserByUsername(
                                user.getEmail()
                        );

        String accessToken =
                jwtService.generateAccessToken(
                        userDetails,
                        user.getRole().name()
                );

        String refreshToken =
                jwtService.generateRefreshToken(
                        userDetails
                );

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .id(user.getId())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .emailVerified(user.getEmailVerified())
                .membershipTier(user.getMembershipTier())
                .build();
    }

    private String generateOtp() {
        int otp =
                100000 +
                RANDOM.nextInt(900000);

        return String.valueOf(otp);
    }
}