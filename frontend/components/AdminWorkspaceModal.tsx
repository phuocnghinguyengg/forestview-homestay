"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { BedDouble, CalendarDays, ClipboardList, LayoutDashboard, MessageSquareQuote, Tag, Users, X } from "lucide-react";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Phòng", icon: BedDouble },
  { href: "/admin/bookings", label: "Đặt phòng", icon: ClipboardList },
  { href: "/admin/users", label: "Khách hàng", icon: Users },
  { href: "/admin/reviews", label: "Đánh giá", icon: MessageSquareQuote },
  { href: "/admin/holidays", label: "Ngày lễ", icon: CalendarDays },
  { href: "/admin/discount-codes", label: "Ưu đãi", icon: Tag },
];

export default function AdminWorkspaceModal({ open, onClose, initialPath = "/admin" }: { open: boolean; onClose: () => void; initialPath?: string }) {
  const [path, setPath] = useState(initialPath);
  if (!open || typeof document === "undefined") return null;
  const current = ADMIN_LINKS.find((item) => item.href === path) ?? ADMIN_LINKS[0];

  return createPortal(
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-ink/35 p-3 backdrop-blur-sm sm:p-6">
      <div role="dialog" aria-modal="true" aria-label="Không gian quản trị" className="flex h-[min(92vh,900px)] w-full max-w-7xl flex-col overflow-hidden rounded-4xl border border-white/70 bg-surface shadow-2xl">
        <header className="relative shrink-0 overflow-hidden border-b border-line bg-canvas px-4 py-4 sm:px-7 sm:py-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-accent to-primary" />
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-sm"><current.icon size={19} /></div>
              <div className="min-w-0"><p className="truncate font-display text-2xl text-ink">ForestView studio</p><p className="mt-0.5 truncate text-xs font-medium tracking-wide text-primary">Không gian quản trị · {current.label}</p></div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-2 text-neutral-400 transition hover:bg-canvas hover:text-ink" aria-label="Đóng không gian quản trị"><X size={19} /></button>
          </div>
          <nav className="mt-4 flex gap-1.5 overflow-x-auto pb-1" aria-label="Khu vực quản trị">
            {ADMIN_LINKS.map((item) => { const Icon = item.icon; return <button key={item.href} type="button" onClick={() => setPath(item.href)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${path === item.href ? "bg-ink text-white shadow-sm" : "bg-surface/70 text-neutral-500 hover:bg-surface hover:text-primary"}`}><Icon size={14} />{item.label}</button>; })}
          </nav>
        </header>
        <div className="min-h-0 flex-1 bg-canvas/40">
          <iframe key={path} title={current.label} src={`${path}?embedded=1`} className="h-full w-full border-0" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
