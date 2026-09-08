"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, LogOut, Settings2, ShieldCheck, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { bookingService } from "@/lib/services/bookingService";
import { Booking } from "@/types";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { getErrorMessage } from "@/lib/getErrorMessage";

function displayName(fullName?: string) {
  const words = fullName?.trim().split(/\s+/).filter(Boolean) ?? [];
  return words.length > 2 ? words.slice(-2).join(" ") : words.join(" ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function AccountPopover({ compact = false }: { compact?: boolean }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"account" | "bookings" | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState("");

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push("/");
  };

  const openBookings = async () => {
    setOpen(false);
    setActiveModal("bookings");
    setBookingsLoading(true);
    setBookingsError("");
    try {
      setBookings(await bookingService.getMine());
    } catch (err) {
      setBookingsError(getErrorMessage(err, "Không thể tải lịch sử đặt phòng"));
    } finally {
      setBookingsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
        }}
        className={`${compact ? "h-10 w-10" : "flex h-10 items-center gap-2 px-2.5"} rounded-full border border-line bg-surface text-ink transition hover:border-primary hover:text-primary`}
        aria-label="Mở bảng điều khiển tài khoản"
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
          {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={32} height={32} unoptimized className="h-full w-full object-cover" /> : <UserRound size={16} />}
        </span>
        {!compact && <span className="hidden max-w-32 truncate text-sm font-semibold sm:block">{displayName(user.fullName)}</span>}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Đóng bảng điều khiển tài khoản" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div className="absolute top-12 right-0 z-50 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
            <div className="flex items-start justify-between bg-ink px-5 py-5 text-white">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/10 font-display text-lg font-bold">
                  {user.avatarUrl ? <Image src={user.avatarUrl} alt="" width={44} height={44} unoptimized className="h-full w-full object-cover" /> : user.fullName.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0"><span className="block truncate font-display text-lg">{displayName(user.fullName)}</span><span className="mt-0.5 block truncate text-xs text-white/55">{user.email}</span></span>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Đóng"><X size={16} /></button>
            </div>
            <div className="space-y-1 p-3 sm:p-4">
              <p className="px-3 pb-2 text-[11px] font-bold tracking-[0.16em] text-neutral-400 uppercase">Điều hướng nhanh</p>
              <button type="button" onClick={() => { setOpen(false); setActiveModal("account"); }} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-semibold text-ink transition hover:bg-canvas hover:text-primary"><Settings2 size={17} /> <span>Tài khoản của tôi<small className="mt-0.5 block text-xs font-normal text-neutral-500">Thông tin và bảo mật</small></span></button>
              <button type="button" onClick={openBookings} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-semibold text-ink transition hover:bg-canvas hover:text-primary"><UserRound size={17} /> <span>Lịch sử đặt phòng<small className="mt-0.5 block text-xs font-normal text-neutral-500">Theo dõi booking và đánh giá</small></span></button>
              {user.role === "ADMIN" && <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-sm font-semibold text-ink transition hover:bg-canvas hover:text-primary"><ShieldCheck size={17} /> <span>Không gian quản trị<small className="mt-0.5 block text-xs font-normal text-neutral-500">Vận hành ForestView</small></span></Link>}
              <div className="my-1 border-t border-line" />
              <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-2xl px-3 py-3.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"><LogOut size={17} /> Đăng xuất</button>
            </div>
          </div>
        </>
      )}

      {activeModal === "account" && <div className="fixed inset-0 z-80 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm sm:p-6">
        <div role="dialog" aria-modal="true" aria-label="Thông tin tài khoản" className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center justify-between bg-ink px-5 py-5 text-white sm:px-6"><div><p className="text-[11px] font-bold tracking-[0.16em] text-white/55 uppercase">Thông tin tài khoản</p><h2 className="mt-1 font-display text-2xl">Hồ sơ của bạn</h2></div><button type="button" onClick={() => setActiveModal(null)} className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Đóng"><X size={17} /></button></div>
          <div className="space-y-4 p-5 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-canvas p-3"><p className="text-[11px] font-semibold text-neutral-400 uppercase">Họ và tên</p><p className="mt-1 text-sm font-semibold text-ink">{user.fullName}</p></div>
                <div className="rounded-2xl bg-canvas p-3"><p className="text-[11px] font-semibold text-neutral-400 uppercase">Vai trò</p><p className="mt-1 text-sm font-semibold text-ink">{user.role === "ADMIN" ? "Quản trị viên" : "Khách lưu trú"}</p></div>
                <div className="rounded-2xl bg-canvas p-3 sm:col-span-2"><p className="text-[11px] font-semibold text-neutral-400 uppercase">Email</p><p className="mt-1 truncate text-sm font-semibold text-ink">{user.email}</p></div>
              </div>
              <Link href="/account" onClick={() => setOpen(false)} className="flex w-full items-center justify-center rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark">Mở cài đặt tài khoản</Link>
          </div>
        </div>
      </div>}

      {activeModal === "bookings" && <div className="fixed inset-0 z-80 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm sm:p-6">
        <div role="dialog" aria-modal="true" aria-label="Lịch sử đặt phòng" className="w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl">
          <div className="flex items-center justify-between bg-ink px-5 py-5 text-white sm:px-6"><div><p className="text-[11px] font-bold tracking-[0.16em] text-white/55 uppercase">Lưu trú</p><h2 className="mt-1 font-display text-2xl">Lịch sử đặt phòng</h2></div><button type="button" onClick={() => setActiveModal(null)} className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Đóng"><X size={17} /></button></div>
          <div className="p-5 sm:p-6">
              <div className="flex justify-end"><CalendarDays className="text-primary" size={22} /></div>
              {bookingsLoading && <p className="py-10 text-center text-sm text-neutral-500">Đang tải booking...</p>}
              {!bookingsLoading && bookingsError && <p className="py-10 text-center text-sm text-red-600">{bookingsError}</p>}
              {!bookingsLoading && !bookingsError && bookings.length === 0 && <p className="py-10 text-center text-sm text-neutral-500">Bạn chưa có booking nào.</p>}
              {!bookingsLoading && !bookingsError && bookings.length > 0 && <div className="mt-5 max-h-72 space-y-2 overflow-y-auto pr-1">{bookings.map((booking) => <div key={booking.id} className="rounded-2xl border border-line p-3"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{booking.roomName}</p><p className="mt-1 text-xs text-neutral-500">{formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}</p></div><BookingStatusBadge status={booking.status} /></div></div>)}</div>}
          </div>
        </div>
      </div>}
    </div>
  );
}
