"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  Star,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import AccountLayout from "@/components/AccountLayout";
import TabSwitcher from "@/components/TabSwitcher";
import { accountService, AccountProfile } from "@/lib/services/accountService";
import { bookingService } from "@/lib/services/bookingService";
import { reviewService } from "@/lib/services/reviewService";
import { Booking, Review } from "@/types";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { useAuthStore } from "@/hooks/useAuthStore";

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none";

const TIER_NAME: Record<string, { label: string; color: string }> = {
  NONE: { label: "Thành viên tiêu chuẩn", color: "bg-neutral-100 text-neutral-700" },
  BRONZE: { label: "Hội viên Bronze (Giảm 5%)", color: "bg-amber-100 text-amber-800" },
  SILVER: { label: "Hội viên Silver (Giảm 10%)", color: "bg-neutral-200 text-neutral-800" },
  GOLD: { label: "Hội viên Gold (Giảm 15%)", color: "bg-yellow-100 text-yellow-800" },
  DIAMOND: { label: "Hội viên Diamond (Giảm 20%)", color: "bg-emerald-100 text-emerald-800" },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function Notice({ message, error }: { message: string; error: string }) {
  if (!message && !error) return null;
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-xs flex items-center gap-2 ${
        error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }`}
    >
      {error ? <AlertCircle size={15} className="shrink-0" /> : <CheckCircle2 size={15} className="shrink-0" />}
      <span>{error || message}</span>
    </div>
  );
}

// 1. TỔNG QUAN
function OverviewTab({
  profile,
  onUpdated,
}: {
  profile: AccountProfile | null;
  onUpdated: (p: AccountProfile) => void;
}) {
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn tệp ảnh hợp lệ");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước ảnh tối đa là 5MB");
      return;
    }

    setUploading(true);
    setError("");
    setMessage("");

    try {
      const uploadedUrl = await accountService.uploadAvatar(file);
      const updated = await accountService.updateProfile({
        fullName: profile?.fullName || user?.fullName || "",
        phone: profile?.phone || "",
        avatarUrl: uploadedUrl,
      });
      onUpdated(updated);
      setMessage("Ảnh đại diện đã được cập nhật thành công!");
    } catch (err) {
      setError(getErrorMessage(err, "Tải ảnh đại diện thất bại"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const tier = TIER_NAME[profile?.membershipTier || user?.membershipTier || "NONE"] || TIER_NAME.NONE;

  return (
    <div className="max-w-2xl space-y-6">
      <Notice message={message} error={error} />

      {/* Avatar & Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 rounded-3xl border border-line bg-canvas/30 p-6">
        <div className="relative group">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 border-2 border-line text-2xl font-bold font-display text-primary">
            {profile?.avatarUrl || user?.avatarUrl ? (
              <Image
                src={profile?.avatarUrl || user?.avatarUrl || ""}
                alt=""
                width={96}
                height={96}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              (profile?.fullName || user?.fullName || "?").charAt(0).toUpperCase()
            )}
          </div>
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            title="Đổi ảnh đại diện"
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-dark transition cursor-pointer"
          >
            <Camera size={14} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
        </div>

        <div className="flex-1 text-center sm:text-left">
          {/* ROLE BADGE: Placed right above the name as requested */}
          <div className="mb-1">
            <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
              {user?.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}
            </span>
          </div>

          <h3 className="font-display text-2xl font-bold text-ink">{profile?.fullName || user?.fullName}</h3>

          {(profile?.username || user?.username) && (
            <p className="text-xs text-neutral-400 font-mono">@{profile?.username || user?.username}</p>
          )}

          <div className="mt-3 flex justify-center sm:justify-start">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-primary/30 bg-surface px-4 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition cursor-pointer"
            >
              {uploading ? "Đang tải ảnh..." : "Đổi ảnh đại diện"}
            </button>
          </div>
        </div>
      </div>

      {/* Information Cards (Name, Email, Membership, Phone - No separate Role row) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-surface p-4">
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Họ và tên</span>
          <p className="mt-1 text-sm font-bold text-ink">{profile?.fullName || user?.fullName}</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Địa chỉ Email</span>
          <p className="mt-1 text-sm font-bold text-ink truncate">{profile?.email || user?.email}</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Hạng hội viên</span>
          <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${tier.color}`}>
            {tier.label}
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4">
          <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Số điện thoại</span>
          <p className="mt-1 text-sm font-bold text-ink">{profile?.phone || user?.phone || "Chưa cập nhật"}</p>
        </div>
      </div>
    </div>
  );
}

// 2. THAY ĐỔI MẬT KHẨU
function PasswordTab({ profile }: { profile: AccountProfile | null }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [otpMethod, setOtpMethod] = useState<"email" | "sms">("email");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setBusy(true);
    try {
      await accountService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setMessage("Đổi mật khẩu thành công.");
    } catch (err) {
      setError(getErrorMessage(err, "Không thể đổi mật khẩu"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl font-bold text-ink">Thay Đổi Mật Khẩu</h2>
      <p className="mt-1 text-xs text-neutral-500">Bảo vệ tài khoản của bạn bằng mật khẩu an toàn.</p>

      {/* OTP Delivery Preference */}
      <div className="mt-5 rounded-2xl border border-line bg-canvas/30 p-3.5">
        <p className="text-xs font-semibold text-neutral-700 mb-2">Tùy chọn nhận mã xác nhận (OTP):</p>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
            <input
              type="radio"
              name="otpMethodPw"
              value="email"
              checked={otpMethod === "email"}
              onChange={() => setOtpMethod("email")}
            />
            <span>Nhận qua Email ({profile?.email}) <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">Khuyên dùng</span></span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-neutral-500">
            <input
              type="radio"
              name="otpMethodPw"
              value="sms"
              checked={otpMethod === "sms"}
              onChange={() => setOtpMethod("sms")}
            />
            <span>Nhận qua Số điện thoại (SMS) <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-500">Sắp hỗ trợ</span></span>
          </label>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-700">Mật khẩu hiện tại</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-700">Mật khẩu mới</label>
          <input
            type="password"
            required
            minLength={6}
            placeholder="Tối thiểu 6 ký tự"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-neutral-700">Xác nhận mật khẩu mới</label>
          <input
            type="password"
            required
            minLength={6}
            placeholder="Nhập lại mật khẩu mới"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
          />
        </div>

        <Notice message={message} error={error} />

        <button
          disabled={busy}
          className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
        >
          {busy ? "Đang cập nhật..." : "Đổi mật khẩu"}
        </button>
      </form>
    </div>
  );
}

// 3. THAY ĐỔI EMAIL
function EmailTab({ profile, onUpdated }: { profile: AccountProfile | null; onUpdated: (p: AccountProfile) => void }) {
  const [newEmail, setNewEmail] = useState(profile?.email ?? "");
  const [otpMethod, setOtpMethod] = useState<"email" | "sms">("email");
  const [otp, setOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const requestEmail = async () => {
    setMessage("");
    setError("");
    if (!newEmail || newEmail === profile?.email) {
      setError("Vui lòng nhập email mới khác email hiện tại.");
      return;
    }
    setBusy("request");
    try {
      await accountService.requestEmailChange({ newEmail: newEmail.trim() });
      setEmailSent(true);
      setMessage("Mã OTP đã được gửi tới email mới.");
    } catch (err) {
      setError(getErrorMessage(err, "Không thể gửi mã OTP"));
    } finally {
      setBusy("");
    }
  };

  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setBusy("verify");
    try {
      const updated = await accountService.verifyEmailChange({ newEmail: newEmail.trim(), otp });
      onUpdated(updated);
      setEmailSent(false);
      setOtp("");
      setMessage("Email đã được cập nhật thành công.");
    } catch (err) {
      setError(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn"));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl font-bold text-ink">Thay Đổi Email</h2>
      <p className="mt-1 text-xs text-neutral-500">Cập nhật email đăng nhập và nhận thông tin xác nhận đặt phòng.</p>

      {/* OTP Delivery Preference */}
      <div className="mt-5 rounded-2xl border border-line bg-canvas/30 p-3.5">
        <p className="text-xs font-semibold text-neutral-700 mb-2">Phương thức nhận mã xác nhận (OTP):</p>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
            <input
              type="radio"
              name="otpMethodEmail"
              value="email"
              checked={otpMethod === "email"}
              onChange={() => setOtpMethod("email")}
            />
            <span>Gửi tới Email mới để xác minh <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">Khuyên dùng</span></span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-neutral-500">
            <input
              type="radio"
              name="otpMethodEmail"
              value="sms"
              checked={otpMethod === "sms"}
              onChange={() => setOtpMethod("sms")}
            />
            <span>Gửi mã tới Số điện thoại (SMS) <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-500">Sắp hỗ trợ</span></span>
          </label>
        </div>
      </div>

      <div className="mt-4 space-y-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-700">Email hiện tại</label>
          <input disabled value={profile?.email ?? ""} className={`${inputClass} bg-neutral-100 text-neutral-400 cursor-not-allowed`} />
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-700">Email mới</label>
          <div className="mt-1 flex gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => {
                setNewEmail(e.target.value);
                setEmailSent(false);
              }}
              className="flex-1 rounded-xl border border-line bg-canvas/40 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={requestEmail}
              disabled={busy === "request"}
              className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {busy === "request" ? "Đang gửi..." : "Gửi OTP"}
            </button>
          </div>
        </div>

        {emailSent && (
          <form onSubmit={verifyEmail} className="mt-3 flex gap-2 rounded-2xl border border-primary/20 bg-primary/5 p-3.5 animate-in fade-in">
            <input
              required
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="Mã OTP 6 số"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-center font-mono tracking-widest text-base font-bold text-ink focus:border-primary focus:outline-none"
            />
            <button
              disabled={busy === "verify" || otp.length !== 6}
              className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
            >
              {busy === "verify" ? "Đang xác thực..." : "Xác thực"}
            </button>
          </form>
        )}

        <Notice message={message} error={error} />
      </div>
    </div>
  );
}

// 4. THAY ĐỔI SỐ ĐIỆN THOẠI
function PhoneTab({ profile, onUpdated }: { profile: AccountProfile | null; onUpdated: (p: AccountProfile) => void }) {
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [otpMethod, setOtpMethod] = useState<"email" | "sms">("email");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setBusy(true);
    try {
      const updated = await accountService.updateProfile({
        fullName: profile?.fullName ?? "",
        phone: phone.trim(),
        avatarUrl: profile?.avatarUrl,
      });
      onUpdated(updated);
      setMessage("Số điện thoại đã được cập nhật thành công.");
    } catch (err) {
      setError(getErrorMessage(err, "Không thể cập nhật số điện thoại"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md">
      <h2 className="font-display text-xl font-bold text-ink">Thay Đổi Số Điện Thoại</h2>
      <p className="mt-1 text-xs text-neutral-500">Cập nhật số điện thoại nhận thông tin phòng &amp; liên hệ check-in.</p>

      {/* OTP Delivery Preference */}
      <div className="mt-5 rounded-2xl border border-line bg-canvas/30 p-3.5">
        <p className="text-xs font-semibold text-neutral-700 mb-2">Tùy chọn xác thực thay đổi:</p>
        <div className="space-y-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-medium text-ink">
            <input
              type="radio"
              name="otpMethodPhone"
              value="email"
              checked={otpMethod === "email"}
              onChange={() => setOtpMethod("email")}
            />
            <span>Xác minh qua Email chính ({profile?.email}) <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">Khuyên dùng</span></span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-neutral-500">
            <input
              type="radio"
              name="otpMethodPhone"
              value="sms"
              checked={otpMethod === "sms"}
              onChange={() => setOtpMethod("sms")}
            />
            <span>Xác minh qua SMS số mới <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-500">Sắp hỗ trợ</span></span>
          </label>
        </div>
      </div>

      <form onSubmit={submit} className="mt-4 space-y-3.5">
        <div>
          <label className="text-xs font-semibold text-neutral-700">Số điện thoại liên hệ</label>
          <input
            inputMode="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="VD: 0912345678"
          />
        </div>

        <Notice message={message} error={error} />

        <button
          disabled={busy}
          className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
        >
          {busy ? "Đang lưu..." : "Lưu số điện thoại"}
        </button>
      </form>
    </div>
  );
}

// 5. LỊCH SỬ ĐẶT PHÒNG
function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    bookingService
      .getMine()
      .then(setBookings)
      .catch((err) => setError(getErrorMessage(err, "Không thể tải lịch sử đặt phòng")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-ink">Lịch Sử Đặt Phòng</h2>
      <p className="text-xs text-neutral-500">Xem lại các kỳ nghỉ của bạn tại ForestView Homestay.</p>

      {loading ? (
        <p className="py-8 text-center text-xs text-neutral-400">Đang tải lịch sử đặt phòng...</p>
      ) : error ? (
        <p className="py-4 text-center text-xs text-rose">{error}</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="text-xs text-neutral-500">Bạn chưa có đơn đặt phòng nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4 shadow-2xs transition hover:border-primary/40"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-ink">#{b.bookingCode}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
                <h4 className="mt-1 font-display text-sm font-bold text-ink">{b.roomName}</h4>
                <p className="text-[11px] text-neutral-500">
                  {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)} ({b.nights} đêm, {b.guestCount} khách)
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-neutral-400 block">Tổng tiền</span>
                <span className="text-sm font-bold text-accent">{formatPrice(b.totalPrice)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 6. LỊCH SỬ ĐÁNH GIÁ
function ReviewsTab() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    reviewService
      .getMine()
      .then(setReviews)
      .catch((err) => setError(getErrorMessage(err, "Không thể tải lịch sử đánh giá")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl font-bold text-ink">Lịch Sử Đánh Giá</h2>
      <p className="text-xs text-neutral-500">Các đánh giá và nhận xét bạn đã gửi sau kỳ nghỉ.</p>

      {loading ? (
        <p className="py-8 text-center text-xs text-neutral-400">Đang tải lịch sử đánh giá...</p>
      ) : error ? (
        <p className="py-4 text-center text-xs text-rose">{error}</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center">
          <p className="text-xs text-neutral-500">Bạn chưa có đánh giá nào.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-line bg-surface p-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-xs font-bold text-ink">{r.roomName}</h4>
                <div className="flex items-center gap-0.5 text-xs text-lantern">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={13} className="fill-lantern text-lantern" />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs italic text-neutral-600">&ldquo;{r.comment}&rdquo;</p>
              <p className="mt-2 text-[10px] text-neutral-400">{formatDate(r.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountContent() {
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [tab, setTab] = useState<"overview" | "password" | "email" | "phone" | "bookings" | "reviews">("overview");
  const updateUser = useAuthStore((s) => s.updateUser);

  useEffect(() => {
    accountService
      .getMe()
      .then((next) => {
        setProfile(next);
        updateUser(next);
      })
      .catch((err) => setLoadError(getErrorMessage(err, "Không thể tải thông tin tài khoản")))
      .finally(() => setLoading(false));
  }, [updateUser]);

  return (
    <AccountLayout>
      <div className="space-y-6">
        <div>
          <p className="font-display text-xs italic text-accent">Bảo mật &amp; thông tin cá nhân</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink">Thông tin của tôi</h1>
        </div>

        {loading && <p className="text-xs text-neutral-500">Đang tải thông tin tài khoản...</p>}
        {loadError && <p className="text-xs text-rose">{loadError}</p>}

        {!loading && !loadError && (
          <>
            <TabSwitcher
              tabs={[
                { key: "overview", label: "Tổng quan", icon: <UserIcon size={15} /> },
                { key: "password", label: "Thay Đổi Mật Khẩu", icon: <KeyRound size={15} /> },
                { key: "email", label: "Thay Đổi Email", icon: <Mail size={15} /> },
                { key: "phone", label: "Thay Đổi Số Điện Thoại", icon: <Phone size={15} /> },
                { key: "bookings", label: "Lịch Sử Đặt Phòng", icon: <CalendarDays size={15} /> },
                { key: "reviews", label: "Lịch Sử Đánh Giá", icon: <Star size={15} /> },
              ]}
              active={tab}
              onChange={setTab}
            />

            {tab === "overview" && (
              <OverviewTab
                profile={profile}
                onUpdated={(next) => {
                  setProfile(next);
                  updateUser(next);
                }}
              />
            )}
            {tab === "password" && <PasswordTab profile={profile} />}
            {tab === "email" && <EmailTab profile={profile} onUpdated={setProfile} />}
            {tab === "phone" && <PhoneTab profile={profile} onUpdated={setProfile} />}
            {tab === "bookings" && <BookingsTab />}
            {tab === "reviews" && <ReviewsTab />}
          </>
        )}
      </div>
    </AccountLayout>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
      <AccountContent />
    </ProtectedRoute>
  );
}
