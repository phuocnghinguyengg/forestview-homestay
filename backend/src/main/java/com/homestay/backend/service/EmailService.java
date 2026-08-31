package com.homestay.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmailService {

    private static final String RESEND_API_URL = "https://api.resend.com/emails";
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy");

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${resend.api-key}")
    private String resendApiKey;

    @Value("${app.mail.from:onboarding@resend.dev}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        String subject = "Mã xác thực ForestView Homestay";
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#333;">
                    <h2 style="color:#2F5D50;">Xin chào %s,</h2>
                    <p>Đây là mã xác thực để hoàn tất đăng ký tài khoản ForestView Homestay:</p>
                    <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#C97A3D;margin:24px 0;">%s</p>
                    <p>Mã có hiệu lực trong <b>10 phút</b>. Không chia sẻ mã này với bất kỳ ai.</p>
                    <p style="margin-top:24px;color:#888;font-size:12px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
                </div>
                """.formatted(escapeHtml(fullName), otp);

        send(toEmail, subject, html, true);
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        String subject = "Chào mừng bạn đến với ForestView Homestay";
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#333;">
                    <h2 style="color:#2F5D50;">Xin chào %s,</h2>
                    <p>Tài khoản của bạn tại <b>ForestView Homestay</b> — Đà Lạt đã được xác thực thành công.</p>
                    <p>Bạn có thể bắt đầu khám phá và đặt những homestay ẩn mình giữa rừng thông ngay bây giờ.</p>
                    <p style="margin-top:24px;color:#888;font-size:12px;">Đây là email tự động, vui lòng không phản hồi.</p>
                </div>
                """.formatted(escapeHtml(fullName));

        send(toEmail, subject, html, false);
    }

    public void sendBookingConfirmation(String toEmail, String fullName, String roomName,
                                         LocalDate checkIn, LocalDate checkOut,
                                         Integer guestCount, BigDecimal totalPrice) {
        sendBookingConfirmation(toEmail, fullName, roomName, checkIn, checkOut, guestCount, totalPrice, "Chờ xác nhận");
    }

    public void sendBookingConfirmation(String toEmail, String fullName, String roomName,
                                         LocalDate checkIn, LocalDate checkOut,
                                         Integer guestCount, BigDecimal totalPrice, String statusText) {
        String subject = "Xác nhận đặt phòng: " + roomName;
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#333;">
                    <h2 style="color:#2F5D50;">Đặt phòng thành công!</h2>
                    <p>Xin chào %s, đơn đặt phòng của bạn đã được ghi nhận:</p>
                    <table style="width:100%%;border-collapse:collapse;margin-top:16px;">
                        <tr><td style="padding:6px 0;color:#888;">Phòng</td><td style="padding:6px 0;"><b>%s</b></td></tr>
                        <tr><td style="padding:6px 0;color:#888;">Nhận phòng</td><td style="padding:6px 0;">%s</td></tr>
                        <tr><td style="padding:6px 0;color:#888;">Trả phòng</td><td style="padding:6px 0;">%s</td></tr>
                        <tr><td style="padding:6px 0;color:#888;">Số khách</td><td style="padding:6px 0;">%d</td></tr>
                        <tr><td style="padding:6px 0;color:#888;">Tổng tiền</td><td style="padding:6px 0;color:#C97A3D;"><b>%,.0f₫</b></td></tr>
                    </table>
                    <p style="margin-top:20px;">Trạng thái hiện tại: <b>%s</b>.</p>
                    <p style="margin-top:24px;color:#888;font-size:12px;">Đây là email tự động, vui lòng không phản hồi.</p>
                </div>
                """.formatted(escapeHtml(fullName), escapeHtml(roomName),
                checkIn.format(DATE_FMT), checkOut.format(DATE_FMT), guestCount, totalPrice, escapeHtml(statusText));

        send(toEmail, subject, html, false);
    }

    private void send(String to, String subject, String html, boolean failRequestOnError) {
        try {
            if (resendApiKey == null || resendApiKey.isBlank()) {
                throw new IllegalStateException("RESEND_API_KEY chưa được cấu hình");
            }
            if (fromEmail == null || fromEmail.isBlank()) {
                throw new IllegalStateException("MAIL_FROM chưa được cấu hình");
            }

            Map<String, Object> payload = Map.of(
                    "from", fromEmail,
                    "to", List.of(to),
                    "subject", subject,
                    "html", html
            );

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(RESEND_API_URL))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + resendApiKey)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header(HttpHeaders.USER_AGENT, "forestview-homestay-backend/1.0")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                String error = extractResendError(response.body());
                throw new IllegalStateException("Resend API trả về HTTP " + response.statusCode() + ": " + error);
            }

            String emailId = extractEmailId(response.body());
            log.info("Email sent successfully via Resend to {} (id={})", to, emailId);
        } catch (Exception e) {
            if (failRequestOnError) {
                log.error("Failed to send required email to {}: {}", to, e.getMessage(), e);
                throw new IllegalStateException("Không thể gửi email OTP: " + e.getMessage(), e);
            }
            log.error("Failed to send non-critical email to {}: {}", to, e.getMessage(), e);
        }
    }

    private String extractEmailId(String body) {
        try {
            JsonNode node = objectMapper.readTree(body);
            return node.path("id").asText("unknown");
        } catch (Exception ignored) {
            return "unknown";
        }
    }

    private String extractResendError(String body) {
        try {
            JsonNode node = objectMapper.readTree(body);
            String message = node.path("message").asText("");
            String name = node.path("name").asText("");
            if (!name.isBlank() && !message.isBlank()) return name + ": " + message;
            if (!message.isBlank()) return message;
        } catch (Exception ignored) {
        }
        return body == null || body.isBlank() ? "Unknown Resend error" : body;
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
    @Async("mailTaskExecutor")
    public void sendPasswordResetOtpEmail(String toEmail, String fullName, String otp) {
        String subject = "Mã OTP đặt lại mật khẩu - ForestView Homestay";
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#333;">
                    <h2 style="color:#2F5D50;">Đặt lại mật khẩu</h2>
                    <p>Xin chào %s,</p>
                    <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
                    <p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#C97A3D;margin:24px 0;">%s</p>
                    <p>Mã có hiệu lực trong <b>10 phút</b>.</p>
                    <p style="margin-top:24px;color:#888;font-size:12px;">Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
                </div>
                """.formatted(escapeHtml(fullName), otp);
        send(toEmail, subject, html, false);
    }


    public void sendBookingStatusEmail(String toEmail, String fullName, String roomName, String status, String reason) {
        String subject = "Cập nhật đơn đặt phòng: " + roomName;
        String reasonHtml = (reason == null || reason.isBlank()) ? "" : "<p><b>Lý do:</b> " + escapeHtml(reason) + "</p>";
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#333;">
                    <h2 style="color:#2F5D50;">Cập nhật đặt phòng</h2>
                    <p>Xin chào %s,</p>
                    <p>Đơn đặt phòng <b>%s</b> hiện có trạng thái: <b>%s</b>.</p>
                    %s
                    <p style="margin-top:24px;color:#888;font-size:12px;">Đây là email tự động của ForestView Homestay.</p>
                </div>
                """.formatted(escapeHtml(fullName), escapeHtml(roomName), escapeHtml(status), reasonHtml);
        send(toEmail, subject, html, false);
    }

    public void sendMembershipUpgradeEmail(String toEmail, String fullName, com.homestay.backend.entity.enums.MembershipTier tier) {
        String subject = "Bạn đã được nâng hạng thành viên ForestView";
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#333;">
                    <h2 style="color:#2F5D50;">Chúc mừng %s!</h2>
                    <p>Tài khoản của bạn đã được nâng lên hạng <b>%s</b>.</p>
                    <p>Ưu đãi hiện tại: giảm <b>%d%%</b> khi đặt phòng.</p>
                    <p style="margin-top:24px;color:#888;font-size:12px;">Đây là email tự động của ForestView Homestay.</p>
                </div>
                """.formatted(escapeHtml(fullName), tierLabel(tier), tier.getDiscountPercent());
        send(toEmail, subject, html, false);
    }

    private String tierLabel(com.homestay.backend.entity.enums.MembershipTier tier) {
        return switch (tier) {
            case BRONZE -> "Đồng";
            case SILVER -> "Bạc";
            case GOLD -> "Vàng";
            case DIAMOND -> "Kim cương";
            default -> "Thành viên";
        };
    }

    @Async("mailTaskExecutor")
    public void sendDiscountCodeEmail(String toEmail, String fullName, String code, Integer percent,
                                       LocalDateTime startAt, LocalDateTime endAt) {
        String subject = "Mã giảm giá mới từ ForestView Homestay: " + code;
        String html = """
                <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#333;">
                    <h2 style="color:#2F5D50;">Xin chào %s,</h2>
                    <p>ForestView Homestay vừa phát hành một mã giảm giá dành cho bạn:</p>
                    <p style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#C97A3D;margin:24px 0;">%s</p>
                    <p>Giảm <b>%d%%</b> trên giá phòng, áp dụng cùng ưu đãi hạng thành viên hiện có của bạn.</p>
                    <p>Thời gian sử dụng: từ <b>%s</b> đến <b>%s</b>.</p>
                    <p style="margin-top:24px;color:#888;font-size:12px;">Đây là email tự động của ForestView Homestay.</p>
                </div>
                """.formatted(escapeHtml(fullName), code, percent,
                startAt.format(DATETIME_FMT), endAt.format(DATETIME_FMT));
        send(toEmail, subject, html, false);
    }

}