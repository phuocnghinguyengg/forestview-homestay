package com.homestay.backend.entity;

import com.homestay.backend.entity.enums.Role;
import com.homestay.backend.entity.enums.MembershipTier;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
@Builder.Default
private Boolean emailVerified = false;

private String otpCode;

private java.time.LocalDateTime otpExpiresAt;

private String emailChangeOtp;
private java.time.LocalDateTime emailChangeOtpExpiresAt;
private String pendingEmail;
private String resetOtpCode;
private java.time.LocalDateTime resetOtpExpiresAt;

@Enumerated(EnumType.STRING)
@Builder.Default
private MembershipTier membershipTier = MembershipTier.NONE;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}