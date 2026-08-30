package com.homestay.backend.service;

import com.homestay.backend.dto.request.DiscountCodeRequest;
import com.homestay.backend.dto.response.DiscountCodePreviewResponse;
import com.homestay.backend.dto.response.DiscountCodeResponse;
import com.homestay.backend.entity.DiscountCode;
import com.homestay.backend.entity.User;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.DiscountCodeRepository;
import com.homestay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscountCodeService {

    private final DiscountCodeRepository discountCodeRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public DiscountCodeResponse create(DiscountCodeRequest request) {
        String normalizedCode = request.getCode().trim().toUpperCase();

        if (discountCodeRepository.existsByCodeIgnoreCase(normalizedCode)) {
            throw new IllegalArgumentException("Mã giảm giá này đã tồn tại");
        }
        if (!request.getEndAt().isAfter(request.getStartAt())) {
            throw new IllegalArgumentException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }

        DiscountCode discountCode = DiscountCode.builder()
                .code(normalizedCode)
                .percent(request.getPercent())
                .description(request.getDescription())
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .active(true)
                .build();

        DiscountCode saved = discountCodeRepository.save(discountCode);

        broadcastToAllUsers(saved);

        return toResponse(saved);
    }

    private void broadcastToAllUsers(DiscountCode discountCode) {
        List<User> users = userRepository.findAll();
        for (User user : users) {
            emailService.sendDiscountCodeEmail(
                    user.getEmail(),
                    user.getFullName(),
                    discountCode.getCode(),
                    discountCode.getPercent(),
                    discountCode.getStartAt(),
                    discountCode.getEndAt()
            );
        }
    }

    public List<DiscountCodeResponse> getAll() {
        return discountCodeRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public void toggleActive(Long id) {
        DiscountCode discountCode = discountCodeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount code not found"));
        discountCode.setActive(!discountCode.getActive());
        discountCodeRepository.save(discountCode);
    }

    public void delete(Long id) {
        if (!discountCodeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Discount code not found");
        }
        discountCodeRepository.deleteById(id);
    }

    public DiscountCodePreviewResponse validate(String code) {
        DiscountCode discountCode = getValidOrThrow(code);
        return DiscountCodePreviewResponse.builder()
                .code(discountCode.getCode())
                .percent(discountCode.getPercent())
                .valid(true)
                .build();
    }

    public DiscountCode getValidOrThrow(String code) {
        DiscountCode discountCode = discountCodeRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không tồn tại"));

        if (!Boolean.TRUE.equals(discountCode.getActive())) {
            throw new IllegalArgumentException("Mã giảm giá này đã bị vô hiệu hóa");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(discountCode.getStartAt())) {
            throw new IllegalArgumentException("Mã giảm giá chưa đến thời gian sử dụng");
        }
        if (now.isAfter(discountCode.getEndAt())) {
            throw new IllegalArgumentException("Mã giảm giá đã hết hạn");
        }

        return discountCode;
    }

    private DiscountCodeResponse toResponse(DiscountCode d) {
        return DiscountCodeResponse.builder()
                .id(d.getId())
                .code(d.getCode())
                .percent(d.getPercent())
                .description(d.getDescription())
                .startAt(d.getStartAt())
                .endAt(d.getEndAt())
                .active(d.getActive())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
