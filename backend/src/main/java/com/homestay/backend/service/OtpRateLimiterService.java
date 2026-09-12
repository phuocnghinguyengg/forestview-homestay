package com.homestay.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Giới hạn tần suất gửi email chứa mã OTP (đăng ký, quên mật khẩu, đổi email...)
 * theo từng "key" (thường là email đã chuẩn hoá, có tiền tố phân biệt hành động
 * để tránh 2 luồng khác nhau vô tình dùng chung ngưỡng chờ của nhau).
 *
 * Lưu trong bộ nhớ (in-memory) vì hệ thống hiện chạy 1 instance; nếu sau này scale
 * nhiều instance thì cần chuyển sang lưu chung (Redis) để giới hạn hoạt động đúng.
 */
@Service
public class OtpRateLimiterService {

    private static final Duration MIN_INTERVAL = Duration.ofSeconds(60);

    private final ConcurrentHashMap<String, Instant> lastSentAt = new ConcurrentHashMap<>();

    /**
     * Kiểm tra xem key này có vừa được dùng để gửi OTP trong khoảng MIN_INTERVAL
     * gần nhất hay không. Nếu còn trong thời gian chờ -> ném lỗi để chặn gửi lại.
     * Nếu hợp lệ -> ghi nhận thời điểm hiện tại rồi cho phép đi tiếp (caller mới
     * thực sự gửi email ngay sau lệnh gọi này).
     */
    public void checkAndRecord(String key) {
        Instant now = Instant.now();
        Instant updated = lastSentAt.merge(key, now, (oldValue, newValue) -> {
            Duration elapsed = Duration.between(oldValue, newValue);
            if (elapsed.compareTo(MIN_INTERVAL) < 0) {
                // Giữ lại mốc thời gian cũ (chưa đủ điều kiện gửi lại) để lần gọi
                // tiếp theo vẫn tính đúng thời gian còn lại, thay vì reset đồng hồ.
                return oldValue;
            }
            return newValue;
        });

        if (!updated.equals(now)) {
            long secondsLeft = MIN_INTERVAL.minus(Duration.between(updated, now)).toSeconds() + 1;
            throw new IllegalArgumentException(
                    "Bạn vừa yêu cầu gửi mã, vui lòng đợi " + secondsLeft + " giây rồi thử lại");
        }
    }

    /** Dọn định kỳ các key đã cũ để tránh tăng bộ nhớ vô hạn theo thời gian. */
    @Scheduled(fixedDelay = 30 * 60 * 1000)
    void cleanup() {
        Instant threshold = Instant.now().minus(MIN_INTERVAL);
        lastSentAt.entrySet().removeIf(entry -> entry.getValue().isBefore(threshold));
    }
}
