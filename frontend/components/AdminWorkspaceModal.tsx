"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  BarChart3,
  BedDouble,
  CalendarDays,
  Gift,
  Star,
  Sunrise,
  Users,
  X,
} from "lucide-react";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Tổng quan", icon: BarChart3 },
  { href: "/admin/rooms", label: "Phòng", icon: BedDouble },
  { href: "/admin/bookings", label: "Đặt phòng", icon: CalendarDays },
  { href: "/admin/users", label: "Khách hàng", icon: Users },
  { href: "/admin/reviews", label: "Đánh giá", icon: Star },
  { href: "/admin/holidays", label: "Ngày lễ", icon: Sunrise },
  { href: "/admin/discount-codes", label: "Ưu đãi", icon: Gift },
];

export default function AdminWorkspaceModal({
  open,
  onClose,
  initialPath = "/admin",
}: {
  open: boolean;
  onClose: () => void;
  initialPath?: string;
}) {
  const [path, setPath] = useState(initialPath);
  if (!open || typeof document === "undefined") return null;
  const current = ADMIN_LINKS.find((item) => item.href === path) ?? ADMIN_LINKS[0];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Thông tin của Homestay"
        className="flex h-[min(90vh,760px)] w-full max-w-5xl flex-col overflow-hidden rounded-none border border-line bg-surface shadow-2xl md:flex-row animate-in zoom-in-95"
      >
        {/* Sidebar tabs */}
        <aside className="w-full shrink-0 border-b border-line bg-canvas/50 p-4 md:w-64 md:border-b-0 md:border-r md:p-5">
          <div className="mb-4 hidden md:block">
            <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">
              Quản trị viên
            </p>
            <h2 className="mt-1 font-display text-xl font-bold text-ink">
              Thông tin của Homestay
            </h2>
          </div>

          <nav className="flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = path === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setPath(item.href)}
                  className={`flex items-center gap-2.5 rounded-none px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-primary text-white shadow-xs"
                      : "text-neutral-600 hover:bg-surface hover:text-primary"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <div className="flex min-w-0 flex-1 flex-col bg-surface">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-line px-6 py-4">
            <h3 className="font-display text-lg font-bold text-ink">
              {current.label}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-line p-1.5 text-neutral-400 hover:bg-canvas hover:text-ink cursor-pointer"
              aria-label="Đóng"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable iframe body */}
          <div className="min-h-0 flex-1 bg-canvas/40">
            <iframe
              key={path}
              title={current.label}
              src={`${path}?embedded=1`}
              className="h-full w-full border-0"
            />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
