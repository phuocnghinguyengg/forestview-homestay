package com.homestay.backend.controller;

import com.homestay.backend.dto.request.AdminUserUpdateRequest;
import com.homestay.backend.dto.response.UserResponse;
import com.homestay.backend.entity.enums.Role;
import com.homestay.backend.entity.enums.MembershipTier;
import com.homestay.backend.dto.request.AdminMembershipRequest;
import com.homestay.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PatchMapping("/{id}/toggle-enabled")
    public ResponseEntity<Void> toggleEnabled(@PathVariable Long id) {
        userService.toggleUserEnabled(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<UserResponse> updateRole(@PathVariable Long id, @RequestParam Role role) {
        return ResponseEntity.ok(userService.updateUserRole(id, role));
    }

    @PatchMapping("/{id}/membership")
    public ResponseEntity<UserResponse> updateMembership(@PathVariable Long id, @Valid @RequestBody AdminMembershipRequest request) {
        return ResponseEntity.ok(userService.updateMembership(id, request.getMembershipTier()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}