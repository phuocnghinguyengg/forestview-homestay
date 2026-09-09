"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  BadgeCheck,
  CalendarClock,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserCog,
  UserRound,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { bookingService } from "@/lib/services/bookingService";
import { Booking } from "@/types";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { accountService, AccountProfile } from "@/lib/services/accountService";
import AdminWorkspaceModal from "@/components/AdminWorkspaceModal";

const TABS = [
  { key: "info", label: "Thông tin", icon: UserRound },
  { key: "edit", label: "Cá nhân", icon: UserCog },
  { key: "password", label: "Mật khẩu", icon: KeyRound },
  { key: "email", label: "Email", icon: Mail },
  { key: "history", label: "Lịch sử", icon: CalendarClock },
] as const;

const TIER_STYLE: Record<string, string> = {
  NONE: "badge-neutral",
  BRONZE: "badge-clay",
  SILVER: "badge-neutral",
  GOLD: "badge-lantern",
  DIAMOND: "badge-jade",
};

function displayName(fullName?: string) {
  const words = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  return words.length > 2 ? words.slice(-2).join(" ") : words.join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AccountPopover({ compact = false }: { compact?: boolean }) {
  const { user, logout, updateUser } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"account" | "admin" | null>(null);
  const [aboutTab, setAboutTab] = useState<(typeof TABS)[number]["key"]>("info");
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [securityBusy, setSecurityBusy] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  const loadBookings = async () => {
    setBookingsLoading(true);
    setBookingsError("");
    try {
      setBookings(await bookingService.getMine());
    } catch (err) {
      setBookingsError(getErrorMessage(err, "Không thể tải lịch sử"));
    } finally {
      setBookingsLoading(false);
    }
  };

  const openAccount = async () => {
    setOpen(false);
    setActiveModal("account");
    setAboutTab("info");
    setProfileLoading(true);
    setProfileError("");
    try {
      const next = await accountService.getMe();
      setProfile(next);
      setEditPhone(next.phone ?? "");
      setNewEmail(next.email);
      updateUser(next);
    } catch (err) {
      setProfileError(getErrorMessage(err, "Không thể tải thông tin cá nhân"));
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");
    if (newPassword !== confirmPassword) {
      setProfileError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setSecurityBusy(true);
    try {
      await accountService.changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setProfileMessage("Đổi mật khẩu thành công.");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Không thể đổi mật khẩu"));
    } finally {
      setSecurityBusy(false);
    }
  };

  const requestEmailChange = async () => {
    setProfileError("");
    setProfileMessage("");
    if (!newEmail.trim() || newEmail.trim() === profile?.email) {
      setProfileError("Vui lòng nhập email mới khác email hiện tại.");
      return;
    }
    setSecurityBusy(true);
    try {
      await accountService.requestEmailChange({ newEmail: newEmail.trim() });
      setEmailSent(true);
      setProfileMessage("Mã OTP đã được gửi tới email mới.");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Không thể gửi mã OTP"));
    } finally {
      setSecurityBusy(false);
    }
  };

  const verifyEmailChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setSecurityBusy(true);
    setProfileError("");
    try {
      const next = await accountService.verifyEmailChange({ newEmail: newEmail.trim(), otp: emailOtp });
      setProfile(next);
      updateUser(next);
      setEmailSent(false);
      setEmailOtp("");
      setProfileMessage("Email đã được cập nhật.");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Mã OTP không đúng hoặc đã hết hạn"));
    } finally {
      setSecurityBusy(false);
    }
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileError("");
    setProfileMessage("");
    try {
      const next = await accountService.updateProfile({ fullName: profile?.fullName ?? user.fullName, phone: editPhone.trim(), avatarUrl: profile?.avatarUrl });
      setProfile(next);
      updateUser(next);
      setProfileMessage("Thông tin cá nhân đã được cập nhật.");
    } catch (err) {
      setProfileError(getErrorMessage(err, "Không thể cập nhật thông tin"));
    } finally {
      setSavingProfile(false);
    }
  };

  const tier = (profile?.membershipTier ?? user.membershipTier ?? "NONE") as string;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`${compact ? "h-10 w-10" : "flex h-10 items-center gap-2 pr-3 pl-1.5"} rounded-full border border-line bg-surface text-ink shadow-sm transition hover:border-primary hover:text-primary`}
        aria-label="Mở bảng điều khiển tài khoản"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
          {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={32} height={32} unoptimized className="block h-full w-full object-cover" /> : <UserRound size={16} />}
        </span>
        {!compact && <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">{displayName(user.fullName)}</span>}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Đóng bảng điều khiển tài khoản" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div className="absolute top-12 right-0 z-50 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
            <div className="dusk-header flex items-center justify-between gap-3 px-5 py-5">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 font-display text-lg font-bold leading-none">
                  {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={44} height={44} unoptimized className="block h-full w-full object-cover" /> : user.fullName.charAt(0).toUpperCase()}
                </span>
                <span className="flex min-w-0 flex-1 flex-col justify-center leading-tight">
                  <span className="block truncate font-display text-lg">{displayName(user.fullName)}</span>
                  <span className="mt-1 block truncate text-xs text-white/55">{user.email}</span>
                </span>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Đóng"><X size={16} /></button>
            </div>
            <div className="space-y-1 p-3 sm:p-4">
              <p className="px-3 pb-2 text-[11px] font-bold tracking-[0.16em] text-neutral-400 uppercase">Về tôi</p>
              <button type="button" onClick={openAccount} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-semibold text-ink transition hover:bg-canvas hover:text-primary">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserCog size={16} /></span>
                <span>Về tôi<small className="mt-0.5 block text-xs font-normal text-neutral-500">Thông tin và bảo mật</small></span>
              </button>
              {user.role === "ADMIN" && (
                <button type="button" onClick={() => { setOpen(false); setActiveModal("admin"); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-semibold text-ink transition hover:bg-canvas hover:text-primary">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lantern/15 text-lantern-dark"><ShieldCheck size={16} /></span>
                  <span>Không gian quản trị<small className="mt-0.5 block text-xs font-normal text-neutral-500">Vận hành ForestView</small></span>
                </button>
              )}
              <div className="my-1 border-t border-line" />
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-semibold text-rose transition hover:bg-rose/10">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose/10"><LogOut size={16} /></span>
                Đăng xuất
              </button>
            </div>
          </div>
        </>
      )}

      {activeModal === "account" && typeof document !== "undefined" && createPortal(
        <div className="modal-overlay">
          <div role="dialog" aria-modal="true" aria-label="Về tôi" className="modal-panel h-[min(86vh,740px)] max-w-2xl">
            <div className="modal-head">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 font-display text-xl font-bold leading-none">
                    {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={48} height={48} unoptimized className="block h-full w-full object-cover" /> : user.fullName.charAt(0).toUpperCase()}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col justify-center leading-tight">
                    <p className="text-[11px] font-bold tracking-[0.16em] text-white/55 uppercase">Về tôi</p>
                    <h2 className="mt-1 truncate font-display text-2xl leading-tight">{displayName(user.fullName)}</h2>
                    <p className="mt-1 truncate text-xs text-white/55">{user.email}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveModal(null)} className="shrink-0 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Đóng"><X size={18} /></button>
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-7">
              <div className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-canvas p-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.key} type="button" onClick={() => { setAboutTab(tab.key); if (tab.key === "history") void loadBookings(); }} className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-semibold transition ${aboutTab === tab.key ? "bg-surface text-primary shadow-sm" : "text-neutral-500 hover:text-primary"}`}>
                      <Icon size={13} />{tab.label}
                    </button>
                  );
                })}
              </div>
              {profileLoading && <p className="py-10 text-center text-sm text-neutral-500">Đang tải thông tin...</p>}
              {!profileLoading && profileError && <p className="py-4 text-sm text-rose">{profileError}</p>}
              {!profileLoading && !profileError && aboutTab === "info" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="panel-card p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 uppercase"><UserRound size={12} /> Họ và tên</p>
                    <p className="mt-1.5 text-sm font-semibold text-ink">{profile?.fullName ?? user.fullName}</p>
                  </div>
                  <div className="panel-card p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 uppercase"><ShieldCheck size={12} /> Vai trò</p>
                    <p className="mt-1.5 text-sm font-semibold text-ink">{user.role === "ADMIN" ? "Quản trị viên" : "Khách lưu trú"}</p>
                  </div>
                  <div className="panel-card p-4 sm:col-span-2">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 uppercase"><Mail size={12} /> Email</p>
                    <p className="mt-1.5 truncate text-sm font-semibold text-ink">{profile?.email ?? user.email}</p>
                  </div>
                  <div className="panel-card p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 uppercase"><Phone size={12} /> Điện thoại</p>
                    <p className="mt-1.5 text-sm font-semibold text-ink">{profile?.phone || "Chưa cập nhật"}</p>
                  </div>
                  <div className="panel-card p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 uppercase"><Sparkles size={12} /> Hội viên</p>
                    <span className={`badge ${TIER_STYLE[tier] ?? "badge-neutral"} mt-1.5`}><BadgeCheck size={12} /> {tier}</span>
                  </div>
                </div>
              )}
              {!profileLoading && !profileError && aboutTab === "edit" && (
                <form onSubmit={saveProfile} className="space-y-3">
                  <div className="panel-card p-4">
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase">Họ và tên</p>
                    <p className="mt-1 text-sm font-semibold text-ink">{profile?.fullName ?? user.fullName}</p>
                    <p className="mt-1 text-xs text-neutral-500">Họ tên được giữ cố định.</p>
                  </div>
                  <label className="field-label">Số điện thoại
                    <input value={editPhone} onChange={(event) => setEditPhone(event.target.value)} className="field-input mt-1" placeholder="Chưa cập nhật" />
                  </label>
                  {profileMessage && <p className="text-sm text-primary">{profileMessage}</p>}
                  <button disabled={savingProfile} className="btn btn-primary w-full">{savingProfile ? "Đang lưu..." : "Lưu thay đổi"}</button>
                </form>
              )}
              {!profileLoading && !profileError && aboutTab === "password" && (
                <form onSubmit={changePassword} className="space-y-3">
                  <label className="field-label">Mật khẩu hiện tại
                    <input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="field-input mt-1" />
                  </label>
                  <label className="field-label">Mật khẩu mới
                    <input required minLength={6} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="field-input mt-1" />
                  </label>
                  <label className="field-label">Xác nhận mật khẩu
                    <input required minLength={6} type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="field-input mt-1" />
                  </label>
                  {profileMessage && <p className="text-sm text-primary">{profileMessage}</p>}
                  <button disabled={securityBusy} className="btn btn-primary w-full">{securityBusy ? "Đang cập nhật..." : "Đổi mật khẩu"}</button>
                </form>
              )}
              {!profileLoading && !profileError && aboutTab === "email" && (
                <div className="space-y-3">
                  <label className="field-label">Email hiện tại
                    <input disabled value={profile?.email ?? user.email} className="field-input mt-1" />
                  </label>
                  <label className="field-label">Email mới
                    <input type="email" value={newEmail} onChange={(event) => { setNewEmail(event.target.value); setEmailSent(false); }} className="field-input mt-1" />
                  </label>
                  {!emailSent ? (
                    <button type="button" onClick={requestEmailChange} disabled={securityBusy} className="btn btn-primary w-full">{securityBusy ? "Đang gửi..." : "Gửi mã OTP"}</button>
                  ) : (
                    <form onSubmit={verifyEmailChange} className="space-y-3">
                      <input required maxLength={6} inputMode="numeric" value={emailOtp} onChange={(event) => setEmailOtp(event.target.value.replace(/\D/g, ""))} placeholder="Mã OTP 6 số" className="field-input text-center text-lg tracking-[0.4em]" />
                      <button disabled={securityBusy || emailOtp.length !== 6} className="btn btn-outline w-full">{securityBusy ? "Đang xác nhận..." : "Xác nhận email"}</button>
                    </form>
                  )}
                  {profileMessage && <p className="text-sm text-primary">{profileMessage}</p>}
                </div>
              )}
              {!profileLoading && !profileError && aboutTab === "history" && (
                <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                  {bookingsLoading && <p className="py-10 text-center text-sm text-neutral-500">Đang tải lịch sử...</p>}
                  {!bookingsLoading && bookingsError && <p className="py-10 text-center text-sm text-rose">{bookingsError}</p>}
                  {!bookingsLoading && !bookingsError && bookings.length === 0 && <p className="py-10 text-center text-sm text-neutral-500">Bạn chưa có booking nào.</p>}
                  {!bookingsLoading && !bookingsError && bookings.map((booking) => (
                    <div key={booking.id} className="panel-card p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{booking.roomName}</p>
                          <p className="mt-1 text-xs text-neutral-500">{formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}</p>
                        </div>
                        <BookingStatusBadge status={booking.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}

      <AdminWorkspaceModal open={activeModal === "admin"} onClose={() => setActiveModal(null)} />
    </div>
  );
}
