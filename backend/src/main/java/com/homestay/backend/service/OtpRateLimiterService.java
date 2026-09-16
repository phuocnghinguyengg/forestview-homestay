package com.homestay.backend.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpRateLimiterService {

    private static final Duration MIN_INTERVAL = Duration.ofSeconds(60);

    private final ConcurrentHashMap<String, Instant> lastSentAt = new ConcurrentHashMap<>();

    public void checkAndRecord(String key) {
        Instant now = Instant.now();
        Instant updated = lastSentAt.merge(key, now, (oldValue, newValue) -> {
            Duration elapsed = Duration.between(oldValue, newValue);
            if (elapsed.compareTo(MIN_INTERVAL) < 0) {
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

    @Scheduled(fixedDelay = 30 * 60 * 1000)
    void cleanup() {
        Instant threshold = Instant.now().minus(MIN_INTERVAL);
        lastSentAt.entrySet().removeIf(entry -> entry.getValue().isBefore(threshold));
    }
}
