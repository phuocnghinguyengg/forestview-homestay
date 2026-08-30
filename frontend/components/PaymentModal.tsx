"use client";

import { useState } from "react";
import { PaymentMethod } from "@/types";

const METHODS: { value: PaymentMethod; label: string; description: string }[] = [
  { value: "CASH", label: "Tiền mặt", description: "Xác nhận đặt phòng ngay." },
  { value: "QR_CODE", label: "QR Code", description: "Thanh toán bằng mã QR." },
  { value: "CARD", label: "NAPAS / VISA / MasterCard", description: "Thanh toán bằng thẻ." },
  { value: "HOLD", label: "Giữ thanh toán", description: "Giữ chỗ trong 2 giờ, chờ admin xác nhận." },
];

export default function PaymentModal({ open, onClose, onConfirm, totalPrice, loading }: { open: boolean; onClose:()=>void; onConfirm:(method:PaymentMethod)=>void; totalPrice:number; loading:boolean }) {
  const [method, setMethod] = useState<PaymentMethod>("QR_CODE");
  if (!open) return null;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-xl">
      <div className="flex items-start justify-between"><div><p className="text-sm text-neutral-500">Bước 2</p><h2 className="font-display text-2xl text-ink">Thanh toán</h2></div><button onClick={onClose} className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100">✕</button></div>
      <div className="mt-4 rounded-xl bg-primary/5 p-4"><p className="text-sm text-neutral-500">Tổng thanh toán</p><p className="mt-1 text-2xl font-semibold text-primary">{new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(totalPrice)}</p></div>
      <div className="mt-4 space-y-2">{METHODS.map(m=><button key={m.value} type="button" onClick={()=>setMethod(m.value)} className={`w-full rounded-xl border p-3 text-left transition ${method===m.value?"border-primary bg-primary/5":"border-line hover:border-primary/40"}`}><div className="flex items-center gap-3"><span className={`h-4 w-4 rounded-full border ${method===m.value?"border-primary bg-primary":"border-neutral-300"}`}/><div><p className="text-sm font-semibold text-ink">{m.label}</p><p className="text-xs text-neutral-500">{m.description}</p></div></div></button>)}</div>
      {method === "HOLD" && <p className="mt-3 rounded-lg bg-accent/10 p-3 text-xs text-accent">Chỗ sẽ được giữ tối đa 2 giờ. Sau thời gian này nếu chưa được xác nhận, hệ thống tự giải phóng.</p>}
      <button disabled={loading} onClick={()=>onConfirm(method)} className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{loading?"Đang xử lý...":method==="HOLD"?"Giữ chỗ 2 giờ":"Xác nhận thanh toán"}</button>
    </div>
  </div>;
}
