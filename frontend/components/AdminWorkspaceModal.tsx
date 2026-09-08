"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { BedDouble, CalendarDays, ClipboardList, LayoutDashboard, MessageSquareQuote, Tag, Users, X, ChevronRight } from "lucide-react";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, color: "bg-blue-500" },
  { href: "/admin/rooms", label: "Phòng", icon: BedDouble, color: "bg-green-500" },
  { href: "/admin/bookings", label: "Đặt phòng", icon: ClipboardList, color: "bg-orange-500" },
  { href: "/admin/users", label: "Khách hàng", icon: Users, color: "bg-purple-500" },
  { href: "/admin/reviews", label: "Đánh giá", icon: MessageSquareQuote, color: "bg-pink-500" },
  { href: "/admin/holidays", label: "Ngày lễ", icon: CalendarDays, color: "bg-red-500" },
  { href: "/admin/discount-codes", label: "Ưu đãi", icon: Tag, color: "bg-amber-500" },
];

export default function AdminWorkspaceModal({ open, onClose, initialPath = "/admin" }: { open: boolean; onClose: () => void; initialPath?: string }) {
  const [path, setPath] = useState(initialPath);
  if (!open || typeof document === "undefined") return null;
  const current = ADMIN_LINKS.find((item) => item.href === path) ?? ADMIN_LINKS[0];

  return createPortal(
    <div className="modal-overlay animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-label="Quản trị ForestView" className="modal-content max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="shrink-0 bg-gradient-primary text-surface px-6 py-8 sm:px-8">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl ${current.color} flex items-center justify-center text-surface shadow-lg`}>
                <current.icon size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80 tracking-wider uppercase">Quản Trị ForestView</p>
                <h2 className="text-3xl font-display font-bold mt-1">{current.label}</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Đóng"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2 overflow-x-auto pb-2" aria-label="Khu vực quản trị">
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive = path === item.href;
              return (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => setPath(item.href)}
                  className={`inline-flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-white/25 text-surface shadow-sm"
                      : "bg-white/10 text-white/80 hover:bg-white/15 hover:text-surface"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                  {isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="min-h-0 flex-1 bg-canvas overflow-hidden">
          <iframe
            key={path}
            title={current.label}
            src={`${path}?embedded=1`}
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

