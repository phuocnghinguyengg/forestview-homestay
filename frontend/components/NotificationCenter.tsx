"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { bookingService } from "@/lib/services/bookingService";
import { Booking } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface Notice {
  id: string;
  title: string;
  description: string;
  href: string;
}

function buildNotices(bookings: Booking[], isAdmin: boolean): Notice[] {
  if (isAdmin) {
    return bookings
      .filter((booking) => booking.status === "PENDING")
      .slice(0, 8)
      .map((booking) => ({
        id: `booking-${booking.id}`,
        title: "Booking cần xác nhận",
        description: `${booking.bookingCode || `#${booking.id}`} · ${booking.roomName} · ${booking.userFullName}`,
        href: "/admin/bookings",
      }));
  }

  return bookings
    .filter((booking) => booking.status === "COMPLETED" && !booking.hasReview)
    .slice(0, 8)
    .map((booking) => ({
      id: `review-${booking.id}`,
      title: "Chia sẻ trải nghiệm của bạn",
      description: `${booking.roomName} · Kỳ nghỉ đã hoàn tất`,
      href: "/dashboard",
    }));
}

export default function NotificationCenter() {
  const { user, isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setLoading(true);
    setError("");
    try {
      const bookings = user.role === "ADMIN" ? await bookingService.getAllAdmin() : await bookingService.getMine();
      setNotices(buildNotices(bookings, user.role === "ADMIN"));
    } catch (err) {
      setError(getErrorMessage(err, "Không thể tải thông báo"));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          if (!open) load();
        }}
        className="relative flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary"
        aria-label="Mở thông báo"
      >
        Thông báo
        {notices.length > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{notices.length > 9 ? "9+" : notices.length}</span>}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div className="absolute top-12 right-0 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-surface shadow-xl">
            <div role="dialog" aria-label="Thông báo">
              <div className="flex items-center justify-between border-b border-line px-4 py-4">
                <p className="font-display text-xl text-ink">Thông báo</p>
                <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-line p-1.5 text-neutral-500 hover:bg-canvas hover:text-ink" aria-label="Đóng thông báo">✕</button>
              </div>

              {loading && <p className="px-5 py-10 text-center text-sm text-neutral-500">Đang tải thông báo...</p>}
              {!loading && error && <p className="px-5 py-10 text-center text-sm text-rose">{error}</p>}
              {!loading && !error && notices.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-semibold text-ink">Bạn đã cập nhật</p>
                  <p className="mt-1 text-xs text-neutral-500">Hiện chưa có thông báo mới.</p>
                </div>
              )}
              {!loading && !error && notices.length > 0 && (
                <div className="max-h-[min(28rem,65vh)] overflow-y-auto p-3">
                  {notices.map((notice) => (
                    <Link key={notice.id} href={notice.href} onClick={() => setOpen(false)} className="block rounded-2xl p-3.5 transition hover:bg-canvas">
                      <span className="block text-sm font-semibold text-ink">{notice.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-neutral-500">{notice.description}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
