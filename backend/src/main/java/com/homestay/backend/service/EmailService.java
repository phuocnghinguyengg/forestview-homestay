package com.homestay.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        String subject = "Mã xác thực ForestView Homestay";
        String html = """
                <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color:#2F5D50;">Xin chào %s,</h2>
                    <p>Đây là mã xác thực để hoàn tất đăng ký tài khoản ForestView Homestay:</p>
                    <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color:#C97A3D; margin: 24px 0;">%s</p>
                    <p>Mã có hiệu lực trong <b>10 phút</b>. Không chia sẻ mã này với bất kỳ ai.</p>
                    <p style="margin-top: 24px; color:#888; font-size: 12px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
                </div>
                """.formatted(fullName, otp);

        send(toEmail, subject, html);
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        String subject = "Chào mừng bạn đến với ForestView Homestay";
        String html = """
                <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color:#2F5D50;">Xin chào %s,</h2>
                    <p>Tài khoản của bạn tại <b>ForestView Homestay</b> — Đà Lạt đã được xác thực thành công.</p>
                    <p>Bạn có thể bắt đầu khám phá và đặt những homestay ẩn mình giữa rừng thông ngay bây giờ.</p>
                    <p style="margin-top: 24px; color:#888; font-size: 12px;">Đây là email tự động, vui lòng không phản hồi.</p>
                </div>
                """.formatted(fullName);

        send(toEmail, subject, html);
    }

    public void sendBookingConfirmation(String toEmail, String fullName, String roomName,
                                         LocalDate checkIn, LocalDate checkOut,
                                         Integer guestCount, BigDecimal totalPrice) {
        String subject = "Xác nhận đặt phòng: " + roomName;
        String html = """
                <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
                    <h2 style="color:#2F5D50;">Đặt phòng thành công!</h2>
                    <p>Xin chào %s, đơn đặt phòng của bạn đã được ghi nhận:</p>
                    <table style="width:100%%; border-collapse: collapse; margin-top: 16px;">
                        <tr><td style="padding:6px 0; color:#888;">Phòng</td><td style="padding:6px 0;"><b>%s</b></td></tr>
                        <tr><td style="padding:6px 0; color:#888;">Nhận phòng</td><td style="padding:6px 0;">%s</td></tr>
                        <tr><td style="padding:6px 0; color:#888;">Trả phòng</td><td style="padding:6px 0;">%s</td></tr>
                        <tr><td style="padding:6px 0; color:#888;">Số khách</td><td style="padding:6px 0;">%d</td></tr>
                        <tr><td style="padding:6px 0; color:#888;">Tổng tiền</td><td style="padding:6px 0; color:#C97A3D;"><b>%,.0f₫</b></td></tr>
                    </table>
                    <p style="margin-top: 20px;">Trạng thái hiện tại: <b>Chờ xác nhận</b>. Chúng tôi sẽ liên hệ sớm để xác nhận đơn đặt phòng.</p>
                    <p style="margin-top: 24px; color:#888; font-size: 12px;">Đây là email tự động, vui lòng không phản hồi.</p>
                </div>
                """.formatted(fullName, roomName, checkIn.format(DATE_FMT), checkOut.format(DATE_FMT), guestCount, totalPrice);

        send(toEmail, subject, html);
    }

    private void send(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
    }
}