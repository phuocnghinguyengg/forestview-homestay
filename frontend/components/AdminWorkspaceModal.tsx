"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { BedDouble, CalendarDays, ClipboardList, LayoutDashboard, MessageSquareQuote, Tag, TreePine, Users, X } from "lucide-react";

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
    <div className="modal-overlay p-2 sm:p-6">
      <div role="dialog" aria-modal="true" aria-label="Không gian quản trị" className="modal-panel modal-panel--row h-[min(94vh,920px)] max-w-7xl overflow-hidden">
        {/* Sidebar */}
        <aside className="dusk-header hidden w-64 shrink-0 flex-col border-r border-white/10 sm:flex">
          <div className="flex items-center gap-2.5 px-5 py-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lantern/20 text-lantern"><TreePine size={17} /></span>
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-tight">ForestView</p>
              <p className="truncate text-[11px] tracking-wide text-white/50">studio quản trị</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3 pb-4" aria-label="Khu vực quản trị">
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;
              const active = path === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setPath(item.href)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? "bg-white/12 text-white" : "text-white/55 hover:bg-white/8 hover:text-white"}`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="relative shrink-0 overflow-hidden border-b border-line bg-canvas px-4 py-4 sm:px-6">
            <div className="hairline-strip absolute inset-x-0 top-0" />
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm sm:hidden"><current.icon size={16} /></span>
                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold tracking-[0.16em] text-primary uppercase">Không gian quản trị</p>
                  <h2 className="truncate font-display text-xl text-ink sm:text-2xl">{current.label}</h2>
                </div>
              </div>
              <button type="button" onClick={onClose} className="shrink-0 rounded-full p-2 text-neutral-400 transition hover:bg-white hover:text-ink" aria-label="Đóng không gian quản trị"><X size={19} /></button>
            </div>
            <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1 sm:hidden" aria-label="Khu vực quản trị">
              {ADMIN_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <button key={item.href} type="button" onClick={() => setPath(item.href)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${path === item.href ? "bg-ink text-white shadow-sm" : "bg-surface/70 text-neutral-500 hover:bg-surface hover:text-primary"}`}>
                    <Icon size={14} />{item.label}
                  </button>
                );
              })}
            </nav>
          </header>
          <div className="min-h-0 flex-1 bg-canvas/40">
            <iframe key={path} title={current.label} src={`${path}?embedded=1`} className="h-full w-full border-0" />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
