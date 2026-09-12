"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { PaymentMethod } from "@/types";

const METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "CASH", label: "Tiền mặt", description: "Thanh toán khi nhận phòng, chờ admin xác nhận." },
  { value: "QR_CODE", label: "QR Code", description: "Chọn phương thức dự kiến, chờ admin xác nhận." },
  { value: "CARD", label: "NAPAS / VISA / MasterCard", description: "Chọn phương thức dự kiến, chờ admin xác nhận." },
  { value: "HOLD", label: "Giữ thanh toán", description: "Giữ chỗ trong 2 giờ, chờ admin xác nhận." },
];

export default function PaymentModal({ open, onClose, onConfirm, totalPrice, loading }: { open: boolean; onClose: () => void; onConfirm: (method: PaymentMethod) => void; totalPrice: number; loading: boolean }) {
  const [method, setMethod] = useState<PaymentMethod>("QR_CODE");
  if (!open) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 90 }}>
      <div role="dialog" aria-modal="true" aria-label="Thanh toán" className="modal-panel max-w-md">
        <div className="modal-head flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-white/55 uppercase">Bước 2</p>
            <h2 className="mt-0.5 font-display text-2xl">Thanh toán</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white" aria-label="Đóng"><X size={18} /></button>
        </div>
        <div className="space-y-4 p-6">
          <div className="panel-card bg-mist/50 p-4">
            <p className="text-sm text-neutral-500">Tổng thanh toán</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice)}</p>
          </div>
          <div className="space-y-2">
            {METHODS.map((m) => (
              <button key={m.value} type="button" onClick={() => setMethod(m.value)} className={`w-full rounded-none border p-3 text-left transition ${method === m.value ? "border-primary bg-primary/5" : "border-line hover:border-primary/40"}`}>
                <div className="flex items-center gap-3">
                  <span className={`h-4 w-4 shrink-0 rounded-full border ${method === m.value ? "border-primary bg-primary" : "border-neutral-300"}`} />
                  <div>
                    <p className="text-sm font-semibold text-ink">{m.label}</p>
                    <p className="text-xs text-neutral-500">{m.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {method === "HOLD" && <p className="rounded-none bg-lantern/10 p-3 text-xs text-lantern-dark">Chỗ sẽ được giữ tối đa 2 giờ. Sau thời gian này nếu chưa được xác nhận, hệ thống tự giải phóng.</p>}
          <button disabled={loading} onClick={() => onConfirm(method)} className="btn btn-primary w-full py-3">{loading ? "Đang xử lý..." : method === "HOLD" ? "Giữ chỗ 2 giờ" : "Gửi yêu cầu đặt phòng"}</button>
        </div>
      </div>
    </div>
  );
}
