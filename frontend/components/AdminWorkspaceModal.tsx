"use client";

import { useState } from "react";
import { createPortal } from "react-dom";

export const ADMIN_LINKS = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/rooms", label: "Phòng" },
  { href: "/admin/bookings", label: "Đặt phòng" },
  { href: "/admin/users", label: "Khách hàng" },
  { href: "/admin/reviews", label: "Đánh giá" },
  { href: "/admin/holidays", label: "Ngày lễ" },
  { href: "/admin/discount-codes", label: "Ưu đãi" },
];

export default function AdminWorkspaceModal({ open, onClose, initialPath = "/admin" }: { open: boolean; onClose: () => void; initialPath?: string }) {
  const [path, setPath] = useState(initialPath);
  if (!open || typeof document === "undefined") return null;
  const current = ADMIN_LINKS.find((item) => item.href === path) ?? ADMIN_LINKS[0];

  return createPortal(
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-label="Không gian quản trị" className="modal-panel h-[min(94vh,920px)] max-w-6xl">
        <div className="modal-head flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-[0.16em] text-primary uppercase">Không gian quản trị</p>
              <h2 className="mt-1 truncate font-display text-2xl text-ink">{current.label}</h2>
            </div>
            <button type="button" onClick={onClose} className="shrink-0 rounded-full border border-line p-2 text-neutral-500 transition hover:bg-canvas hover:text-ink" aria-label="Đóng không gian quản trị">✕</button>
          </div>
          <nav className="tab-row" aria-label="Khu vực quản trị">
            {ADMIN_LINKS.map((item) => (
              <button key={item.href} type="button" onClick={() => setPath(item.href)} className={`tab-row-btn ${path === item.href ? "active" : ""}`}>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="min-h-0 flex-1 bg-canvas/40">
          <iframe key={path} title={current.label} src={`${path}?embedded=1`} className="h-full w-full border-0" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
