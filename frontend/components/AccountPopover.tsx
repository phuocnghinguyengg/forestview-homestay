"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Camera,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  CalendarDays,
  Star,
  User as UserIcon,
  X,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { bookingService } from "@/lib/services/bookingService";
import { reviewService } from "@/lib/services/reviewService";
import { Booking, Review } from "@/types";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { accountService, AccountProfile } from "@/lib/services/accountService";
import AdminWorkspaceModal from "@/components/AdminWorkspaceModal";

const TABS = [
  { key: "overview", label: "Tổng quan", icon: UserIcon },
  { key: "password", label: "Thay đổi mật khẩu", icon: KeyRound },
  { key: "email", label: "Thay đổi email", icon: Mail },
  { key: "phone", label: "Thay đổi số điện thoại", icon: Phone },
  { key: "bookings", label: "Lịch sử đặt phòng", icon: CalendarDays },
  { key: "reviews", label: "Lịch sử đánh giá", icon: Star },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const TIER_NAME: Record<string, { label: string; color: string }> = {
  NONE: { label: "Thành viên tiêu chuẩn", color: "bg-neutral-100 text-neutral-700" },
  BRONZE: { label: "Hội viên Bronze (Giảm 5%)", color: "bg-amber-100 text-amber-800" },
  SILVER: { label: "Hội viên Silver (Giảm 10%)", color: "bg-neutral-200 text-neutral-800" },
  GOLD: { label: "Hội viên Gold (Giảm 15%)", color: "bg-yellow-100 text-yellow-800" },
  DIAMOND: { label: "Hội viên Diamond (Giảm 20%)", color: "bg-emerald-100 text-emerald-800" },
};

function displayName(fullName?: string) {
  const words = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  return words.length > 2 ? words.slice(-2).join(" ") : words.join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function Avatar({ url, name, size = 32 }: { url?: string | null; name: string; size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 font-display font-bold text-primary border border-line"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {url ? (
        <Image src={url} alt="" width={size} height={size} unoptimized className="block h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

export default function AccountPopover({ compact = false }: { compact?: boolean }) {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"account" | "admin" | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Profile data
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  // OTP channel preference
  const [otpMethod, setOtpMethod] = useState<"email" | "sms">("email");

  // Password tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);

  // Email tab state
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  // Phone tab state
  const [newPhone, setNewPhone] = useState("");
  const [phoneBusy, setPhoneBusy] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  const loadProfile = async () => {
    setProfileLoading(true);
    setProfileError("");
    try {
      const next = await accountService.getMe();
      setProfile(next);
      setNewPhone(next.phone ?? "");
      setNewEmail(next.email);
      updateUser(next);
    } catch (err) {
      setProfileError(getErrorMessage(err, "Không thể tải thông tin cá nhân"));
    } finally {
      setProfileLoading(false);
    }
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    setBookingsError("");
    try {
      const data = await bookingService.getMine();
      setBookings(data);
    } catch (err) {
      setBookingsError(getErrorMessage(err, "Không thể tải lịch sử đặt phòng"));
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const data = await reviewService.getMine();
      setReviews(data);
    } catch (err) {
      setReviewsError(getErrorMessage(err, "Không thể tải lịch sử đánh giá"));
    } finally {
      setReviewsLoading(false);
    }
  };

  const openAccount = async () => {
    setOpen(false);
    setActiveModal("account");
    setActiveTab("overview");
    await loadProfile();
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileError("Vui lòng chọn tệp ảnh hợp lệ");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Kích thước ảnh tối đa là 5MB");
      return;
    }

    setAvatarUploading(true);
    setProfileError("");
    setProfileMessage("");

    try {
      // 1. Upload image to server / Cloudinary
      const uploadedUrl = await accountService.uploadAvatar(file);
      // 2. Update user profile with the new avatar url
      const updated = await accountService.updateProfile({
        fullName: profile?.fullName || user.fullName,
        phone: profile?.phone || "",
        avatarUrl: uploadedUrl,
      });
      setProfile(updated);
      updateUser(updated);
      setProfileMessage("Đã cập nhật ảnh đại diện thành công!");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Tải ảnh đại diện thất bại"));
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");

    if (newPassword.length < 6) {
      setProfileError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setProfileError("Mật khẩu xác nhận không khớp");
      return;
    }

    setPasswordBusy(true);
    try {
      await accountService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfileMessage("Đổi mật khẩu thành công!");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Đổi mật khẩu thất bại"));
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleRequestEmail = async () => {
    setProfileError("");
    setProfileMessage("");
    if (!newEmail.trim() || newEmail.trim() === profile?.email) {
      setProfileError("Vui lòng nhập email mới khác với email hiện tại");
      return;
    }

    setEmailBusy(true);
    try {
      await accountService.requestEmailChange({ newEmail: newEmail.trim() });
      setEmailSent(true);
      setProfileMessage(
        otpMethod === "email"
          ? "Mã OTP đã được gửi tới email mới của bạn."
          : "Tính năng gửi OTP qua SMS đang thử nghiệm. Mã OTP mẫu đã được gửi tới email."
      );
    } catch (err) {
      setProfileError(getErrorMessage(err, "Không thể gửi mã OTP"));
    } finally {
      setEmailBusy(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailBusy(true);
    setProfileError("");
    try {
      const next = await accountService.verifyEmailChange({ newEmail: newEmail.trim(), otp: emailOtp });
      setProfile(next);
      updateUser(next);
      setEmailSent(false);
      setEmailOtp("");
      setProfileMessage("Email tài khoản đã được cập nhật thành công!");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn"));
    } finally {
      setEmailBusy(false);
    }
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneBusy(true);
    setProfileError("");
    setProfileMessage("");
    try {
      const next = await accountService.updateProfile({
        fullName: profile?.fullName ?? user.fullName,
        phone: newPhone.trim(),
        avatarUrl: profile?.avatarUrl,
      });
      setProfile(next);
      updateUser(next);
      setProfileMessage("Số điện thoại đã được cập nhật thành công!");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Không thể cập nhật số điện thoại"));
    } finally {
      setPhoneBusy(false);
    }
  };

  const tierInfo = TIER_NAME[profile?.membershipTier || user.membershipTier || "NONE"] || TIER_NAME.NONE;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${compact ? "h-10 w-10" : "flex h-10 items-center gap-2 pr-3 pl-1.5"} rounded-full border border-line bg-surface text-ink shadow-sm transition hover:border-primary hover:text-primary cursor-pointer`}
        aria-label="Mở bảng điều khiển tài khoản"
      >
        <Avatar url={user.avatarUrl} name={user.fullName} size={32} />
        {!compact && <span className="hidden max-w-32 truncate text-xs font-semibold sm:block">{displayName(user.fullName)}</span>}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Đóng bảng điều khiển" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div className="absolute top-12 right-0 z-50 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-3 border-b border-line bg-canvas/60 px-5 py-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar url={user.avatarUrl} name={user.fullName} size={42} />
                <span className="flex min-w-0 flex-1 flex-col justify-center leading-tight">
                  <span className="block truncate font-display text-base font-bold text-ink">{displayName(user.fullName)}</span>
                  <span className="mt-0.5 block truncate text-xs text-neutral-500">{user.email}</span>
                </span>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-line p-1.5 text-neutral-500 hover:bg-surface hover:text-ink cursor-pointer" aria-label="Đóng">✕</button>
            </div>

            <div className="space-y-1 p-3">
              <button
                type="button"
                onClick={openAccount}
                className="flex w-full items-center rounded-2xl px-3.5 py-3 text-left text-xs font-semibold text-ink transition hover:bg-primary/10 hover:text-primary cursor-pointer"
              >
                <span>
                  Thông tin của tôi
                  <small className="mt-0.5 block text-[11px] font-normal text-neutral-500">Xem hồ sơ &amp; cài đặt bảo mật</small>
                </span>
              </button>

              {user.role === "ADMIN" && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setActiveModal("admin");
                  }}
                  className="flex w-full items-center rounded-2xl px-3.5 py-3 text-left text-xs font-semibold text-ink transition hover:bg-primary/10 hover:text-primary cursor-pointer"
                >
                  <span>
                    Không gian quản trị
                    <small className="mt-0.5 block text-[11px] font-normal text-neutral-500">Quản lý hệ thống ForestView</small>
                  </span>
                </button>
              )}

              <div className="my-1 border-t border-line/60" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center rounded-2xl px-3.5 py-2.5 text-left text-xs font-semibold text-rose hover:bg-rose/10 cursor-pointer"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= MODAL: THÔNG TIN CỦA TÔI ================= */}
      {activeModal === "account" && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveModal(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="flex h-[min(90vh,760px)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl md:flex-row animate-in zoom-in-95"
          >
            {/* Sidebar tabs */}
            <aside className="w-full shrink-0 border-b border-line bg-canvas/50 p-4 md:w-64 md:border-b-0 md:border-r md:p-5">
              <div className="mb-4 hidden md:block">
                <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">Cài đặt tài khoản</p>
                <h2 className="mt-1 font-display text-xl font-bold text-ink">Thông tin của tôi</h2>
              </div>

              <nav className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.key);
                        setProfileError("");
                        setProfileMessage("");
                        if (tab.key === "bookings") void loadBookings();
                        if (tab.key === "reviews") void loadReviews();
                      }}
                      className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-xs"
                          : "text-neutral-600 hover:bg-surface hover:text-primary"
                      }`}
                    >
                      <Icon size={16} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main tab content */}
            <div className="flex min-w-0 flex-1 flex-col bg-surface">
              {/* Head */}
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                <h3 className="font-display text-lg font-bold text-ink">
                  {TABS.find((t) => t.key === activeTab)?.label}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="rounded-full border border-line p-1.5 text-neutral-400 hover:bg-canvas hover:text-ink cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
                {profileError && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}
                {profileMessage && (
                  <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0" />
                    <span>{profileMessage}</span>
                  </div>
                )}

                {/* 1. TAB: TỔNG QUAN (OVERVIEW) */}
                {activeTab === "overview" && (
                  profileLoading ? (
                    <p className="py-8 text-center text-xs text-neutral-400">Đang tải thông tin cá nhân...</p>
                  ) : (
                  <div className="max-w-xl space-y-6">
                    {/* Avatar & Header */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 rounded-2xl border border-line bg-canvas/30 p-5">
                      <div className="relative group">
                        <Avatar
                          url={profile?.avatarUrl || user.avatarUrl}
                          name={profile?.fullName || user.fullName}
                          size={88}
                        />
                        <button
                          type="button"
                          disabled={avatarUploading}
                          onClick={() => fileInputRef.current?.click()}
                          title="Đổi ảnh đại diện"
                          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-dark transition cursor-pointer"
                        >
                          <Camera size={14} />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarFile}
                        />
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        {/* ROLE BADGE: Placed right above the name as requested! */}
                        <div className="mb-1">
                          <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                            {user.role === "ADMIN" ? "Quản trị viên" : "Thành viên"}
                          </span>
                        </div>

                        {/* Name */}
                        <h4 className="font-display text-2xl font-bold text-ink">
                          {profile?.fullName || user.fullName}
                        </h4>

                        {/* Username */}
                        {(profile?.username || user.username) && (
                          <p className="text-xs text-neutral-400 font-mono">
                            @{profile?.username || user.username}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 justify-center sm:justify-start">
                          <button
                            type="button"
                            disabled={avatarUploading}
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-full border border-primary/30 bg-white px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition cursor-pointer"
                          >
                            {avatarUploading ? "Đang tải ảnh..." : "Đổi ảnh đại diện"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Information Grid: Name, Email, Membership, Phone (NO separate role row) */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-line bg-surface p-4">
                        <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Họ và tên</span>
                        <p className="mt-1 text-sm font-bold text-ink">{profile?.fullName || user.fullName}</p>
                      </div>

                      <div className="rounded-2xl border border-line bg-surface p-4">
                        <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Địa chỉ Email</span>
                        <p className="mt-1 text-sm font-bold text-ink truncate">{profile?.email || user.email}</p>
                      </div>

                      <div className="rounded-2xl border border-line bg-surface p-4">
                        <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Hạng hội viên</span>
                        <span className={`inline-block mt-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${tierInfo.color}`}>
                          {tierInfo.label}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-line bg-surface p-4">
                        <span className="text-[11px] font-semibold text-neutral-400 block uppercase">Số điện thoại</span>
                        <p className="mt-1 text-sm font-bold text-ink">
                          {profile?.phone || user.phone || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>
                  </div>
                  )
                )}

                {/* 2. TAB: THAY ĐỔI MẬT KHẨU */}
                {activeTab === "password" && (
                  <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
                    {/* OTP Option */}
                    <div className="rounded-2xl border border-line bg-canvas/30 p-3.5">
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
                          <span>Nhận qua Email ({profile?.email || user.email}) <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">Khuyên dùng</span></span>
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

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Mật khẩu hiện tại</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/30 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Mật khẩu mới</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Tối thiểu 6 ký tự"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/30 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Nhập lại mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/30 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordBusy}
                      className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer mt-2"
                    >
                      {passwordBusy ? "Đang cập nhật..." : "Đổi mật khẩu"}
                    </button>
                  </form>
                )}

                {/* 3. TAB: THAY ĐỔI EMAIL */}
                {activeTab === "email" && (
                  <div className="max-w-md space-y-4">
                    {/* OTP Option */}
                    <div className="rounded-2xl border border-line bg-canvas/30 p-3.5">
                      <p className="text-xs font-semibold text-neutral-700 mb-2">Phương thức gửi mã xác nhận (OTP):</p>
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

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Email hiện tại</label>
                      <input
                        disabled
                        value={profile?.email || user.email}
                        className="w-full rounded-xl border border-line bg-neutral-100 px-3.5 py-2.5 text-xs font-medium text-neutral-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Email mới</label>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          required
                          placeholder="emailmoi@example.com"
                          value={newEmail}
                          onChange={(e) => {
                            setNewEmail(e.target.value);
                            setEmailSent(false);
                          }}
                          className="flex-1 rounded-xl border border-line bg-canvas/30 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleRequestEmail}
                          disabled={emailBusy}
                          className="rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer shrink-0"
                        >
                          {emailBusy ? "Đang gửi..." : "Gửi OTP"}
                        </button>
                      </div>
                    </div>

                    {emailSent && (
                      <form onSubmit={handleVerifyEmail} className="mt-4 space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in">
                        <label className="block text-xs font-semibold text-primary">Nhập mã OTP 6 số đã nhận:</label>
                        <div className="flex gap-2">
                          <input
                            required
                            maxLength={6}
                            placeholder="Mã 6 số"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                            className="flex-1 rounded-xl border border-line bg-white px-3 py-2 text-center font-mono tracking-widest text-base font-bold text-ink focus:border-primary focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={emailBusy || emailOtp.length !== 6}
                            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
                          >
                            Xác nhận
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* 4. TAB: THAY ĐỔI SỐ ĐIỆN THOẠI */}
                {activeTab === "phone" && (
                  <form onSubmit={handleSavePhone} className="max-w-md space-y-4">
                    {/* OTP Option */}
                    <div className="rounded-2xl border border-line bg-canvas/30 p-3.5">
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
                          <span>Xác minh qua Email chính ({profile?.email || user.email}) <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">Khuyên dùng</span></span>
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

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">Số điện thoại liên hệ</label>
                      <input
                        type="tel"
                        required
                        placeholder="VD: 0912345678"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/30 px-3.5 py-2.5 text-xs font-medium text-ink focus:border-primary focus:bg-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={phoneBusy}
                      className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white shadow-md hover:bg-primary-dark transition disabled:opacity-50 cursor-pointer"
                    >
                      {phoneBusy ? "Đang lưu..." : "Cập nhật số điện thoại"}
                    </button>
                  </form>
                )}

                {/* 5. TAB: LỊCH SỬ ĐẶT PHÒNG */}
                {activeTab === "bookings" && (
                  <div className="space-y-3">
                    {bookingsLoading ? (
                      <p className="py-8 text-center text-xs text-neutral-400">Đang tải lịch sử đặt phòng...</p>
                    ) : bookingsError ? (
                      <p className="py-4 text-center text-xs text-rose">{bookingsError}</p>
                    ) : bookings.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-line p-8 text-center">
                        <p className="text-xs text-neutral-500">Bạn chưa có đơn đặt phòng nào.</p>
                      </div>
                    ) : (
                      bookings.map((b) => (
                        <div
                          key={b.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-line bg-canvas/20 p-4 transition hover:border-primary/40"
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
                      ))
                    )}
                  </div>
                )}

                {/* 6. TAB: LỊCH SỬ ĐÁNH GIÁ */}
                {activeTab === "reviews" && (
                  <div className="space-y-3">
                    {reviewsLoading ? (
                      <p className="py-8 text-center text-xs text-neutral-400">Đang tải đánh giá của bạn...</p>
                    ) : reviewsError ? (
                      <p className="py-4 text-center text-xs text-rose">{reviewsError}</p>
                    ) : reviews.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-line p-8 text-center">
                        <p className="text-xs text-neutral-500">Bạn chưa gửi đánh giá nào cho các kỳ nghỉ trước.</p>
                      </div>
                    ) : (
                      reviews.map((r) => (
                        <div
                          key={r.id}
                          className="rounded-2xl border border-line bg-canvas/20 p-4 transition hover:border-primary/40"
                        >
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
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Admin Workspace Modal */}
      {activeModal === "admin" && (
        <AdminWorkspaceModal open={true} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
