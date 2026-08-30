"use client";
import { useState } from "react";
import { PaymentMethod } from "@/types";
import { bookingService } from "@/lib/services/bookingService";
import { Booking } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";

export default function BookingPaymentModal({ bookingData, onSuccess, onClose }: { bookingData: { roomId:number; checkInDate:string; checkOutDate:string; guestCount:number; note?:string }; onSuccess:(b:Booking)=>void; onClose:()=>void }) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const options: {value:PaymentMethod;label:string;desc:string;icon:string}[] = [
    { value:"CASH", label:"Tiền mặt", desc:"Thanh toán trực tiếp", icon:"₫" },
    { value:"QR_CODE", label:"QR Code", desc:"Quét mã để thanh toán", icon:"▦" },
    { value:"CARD", label:"Thẻ NAPAS / VISA / MasterCard", desc:"Thanh toán bằng thẻ", icon:"▱" },
  ];
  const submit = async () => {
    if (!method) return setError("Vui lòng chọn phương thức thanh toán");
    setBusy(true); setError("");
    try { const b = await bookingService.create({...bookingData, paymentMethod:method}); onSuccess(b); }
    catch(e) { setError(getErrorMessage(e,"Không thể tạo đơn đặt phòng")); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-2xl bg-surface p-6 shadow-2xl">
      <div className="flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Bước cuối</p><h2 className="mt-1 font-display text-2xl text-ink">Thanh toán</h2></div><button onClick={onClose} className="rounded-full p-2 text-neutral-400 hover:bg-neutral-100">✕</button></div>
      <div className="mt-5 space-y-3">
        {options.map(o => <button key={o.value} type="button" onClick={()=>setMethod(o.value)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left ${method===o.value?'border-primary bg-primary/5':'border-line hover:border-primary/40'}`}><span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg text-primary">{o.icon}</span><span><b className="block text-sm text-ink">{o.label}</b><span className="text-xs text-neutral-500">{o.desc}</span></span>{method===o.value&&<span className="ml-auto text-primary">✓</span>}</button>)}
        <button type="button" onClick={()=>setMethod("HOLD")} className={`w-full rounded-xl border p-4 text-left ${method==='HOLD'?'border-accent bg-accent/5':'border-line hover:border-accent/40'}`}><b className="block text-sm text-ink">Giữ thanh toán — giữ chỗ 2 giờ</b><span className="text-xs text-neutral-500">Chưa thanh toán. Đơn sẽ chờ admin xác nhận.</span></button>
      </div>
      {error&&<p className="mt-4 text-sm text-red-600">{error}</p>}
      <button onClick={submit} disabled={busy||!method} className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50">{busy?'Đang xử lý...':method==='HOLD'?'Giữ chỗ 2 giờ':'Xác nhận thanh toán'}</button>
    </div>
  </div>
}
