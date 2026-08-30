package com.homestay.backend.service;

import com.homestay.backend.dto.request.AdminUserUpdateRequest;
import com.homestay.backend.dto.response.UserResponse;
import com.homestay.backend.entity.User;
import com.homestay.backend.entity.enums.Role;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.UserRepository;
import com.homestay.backend.service.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    /**
     * Lấy danh sách tất cả người dùng.
     */
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toResponse)
                .toList();
    }

    /**
     * Bật / tắt tài khoản người dùng.
     */
    public void toggleUserEnabled(Long id) {
        User user = getUserOrThrow(id);

        user.setEnabled(!Boolean.TRUE.equals(user.getEnabled()));

        userRepository.save(user);
    }

    /**
     * Cập nhật role của người dùng.
     */
    public UserResponse updateUserRole(Long id, Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Role không được để trống");
        }

        User user = getUserOrThrow(id);

        user.setRole(role);

        User savedUser = userRepository.save(user);

        return UserMapper.toResponse(savedUser);
    }

    /**
     * Admin cập nhật thông tin người dùng.
     *
     * Nếu email thay đổi:
     * - Kiểm tra email mới chưa được sử dụng.
     * - Đặt emailVerified = false.
     * - Người dùng phải xác thực lại email mới.
     */
    public UserResponse updateUser(
            Long id,
            AdminUserUpdateRequest request
    ) {
        if (request == null) {
            throw new IllegalArgumentException(
                    "Thông tin cập nhật không được để trống"
            );
        }

        User user = getUserOrThrow(id);

        String newEmail = request.getEmail();

        if (newEmail == null || newEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "Email không được để trống"
            );
        }

        newEmail = newEmail.trim();

        boolean emailChanged =
                user.getEmail() == null
                        || !user.getEmail().equalsIgnoreCase(newEmail);

        /*
         * Chỉ kiểm tra email tồn tại khi email thực sự thay đổi.
         */
        if (emailChanged && userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException(
                    "Email này đã được sử dụng bởi tài khoản khác"
            );
        }

        if (request.getFullName() != null) {
            user.setFullName(request.getFullName().trim());
        }

        user.setEmail(newEmail);

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }

        /*
         * Email mới phải được xác thực lại.
         */
        if (emailChanged) {
            user.setEmailVerified(false);
        }

        User savedUser = userRepository.save(user);

        return UserMapper.toResponse(savedUser);
    }

    /**
     * Xóa người dùng.
     */
    public void deleteUser(Long id) {
        User user = getUserOrThrow(id);

        userRepository.delete(user);
    }

    /**
     * Tìm người dùng hoặc báo lỗi.
     */
    @Transactional(readOnly = true)
    protected User getUserOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }
}