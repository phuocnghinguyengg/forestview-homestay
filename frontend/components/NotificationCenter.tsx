"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Bell, CheckCircle2, ClipboardCheck, MessageSquareText, X } from "lucide-react";
import { bookingService } from "@/lib/services/bookingService";
import { Booking } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

interface Notice {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: typeof Bell;
  tone: string;
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
        icon: ClipboardCheck,
        tone: "bg-accent/10 text-accent",
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
      icon: MessageSquareText,
      tone: "bg-primary/10 text-primary",
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
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-primary hover:text-primary"
        aria-label="Mở thông báo"
      >
        <Bell size={17} />
        {notices.length > 0 && <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{notices.length > 9 ? "9+" : notices.length}</span>}
      </button>

      {open && (
        <>
          <button type="button" aria-label="Đóng thông báo" onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default bg-ink/25 backdrop-blur-sm" />
          {typeof document !== "undefined" && createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div role="dialog" aria-modal="true" aria-label="Thông báo" className="w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-5 sm:px-6">
              <div>
                <p className="font-display text-2xl text-ink">Thông báo</p>
                <p className="mt-1 text-xs text-neutral-500">{user.role === "ADMIN" ? "Việc cần xử lý" : "Điều đáng nhớ trong chuyến đi"}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1.5 text-neutral-400 hover:bg-canvas hover:text-ink" aria-label="Đóng thông báo"><X size={16} /></button>
            </div>

            {loading && <p className="px-5 py-10 text-center text-sm text-neutral-500">Đang tải thông báo...</p>}
            {!loading && error && <p className="px-5 py-10 text-center text-sm text-red-600">{error}</p>}
            {!loading && !error && notices.length === 0 && (
              <div className="px-5 py-10 text-center">
                <CheckCircle2 className="mx-auto text-primary" size={24} />
                <p className="mt-2 text-sm font-semibold text-ink">Bạn đã cập nhật</p>
                <p className="mt-1 text-xs text-neutral-500">Hiện chưa có thông báo mới.</p>
              </div>
            )}
            {!loading && !error && notices.length > 0 && (
              <div className="max-h-[min(28rem,65vh)] overflow-y-auto p-3">
                {notices.map((notice) => {
                  const Icon = notice.icon;
                  return (
                    <Link key={notice.id} href={notice.href} onClick={() => setOpen(false)} className="flex gap-3 rounded-2xl p-3.5 transition hover:bg-canvas">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notice.tone}`}><Icon size={17} /></span>
                      <span className="min-w-0"><span className="block text-sm font-semibold text-ink">{notice.title}</span><span className="mt-0.5 block truncate text-xs text-neutral-500">{notice.description}</span></span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          </div>, document.body)}
        </>
      )}
    </div>
  );
}
