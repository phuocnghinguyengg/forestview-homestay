"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { bookingService } from "@/lib/services/bookingService";
import { PaymentMethod, Room, MembershipTier } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { accountService } from "@/lib/services/accountService";
import { getErrorMessage } from "@/lib/getErrorMessage";
import Link from "next/link";
import PaymentModal from "./PaymentModal";

function formatPrice(price: number) { return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price); }
function formatDate(date: string) { return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN"); }

export default function RoomTypeBookingModal({ type, typeLabel, checkIn, checkOut, onClose }: { type: "SINGLE"|"DOUBLE"|"FAMILY"|"DELUXE"; typeLabel: string; checkIn: string; checkOut: string; onClose:()=>void }) {
  const router=useRouter(); const {isAuthenticated,user}=useAuthStore();
  const [rooms,setRooms]=useState<Room[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [selectedRoom,setSelectedRoom]=useState<Room|null>(null); const [guestCount,setGuestCount]=useState(1); const [note,setNote]=useState("");
  const [paymentOpen,setPaymentOpen]=useState(false); const [submitting,setSubmitting]=useState(false); const [result,setResult]=useState<{code:string;status:string}|null>(null);
  const [membership,setMembership]=useState<{tier:MembershipTier;discount:number}>({tier:user?.membershipTier??"NONE",discount:0});

  useEffect(()=>{ roomTypeService.getAvailableRooms(type,checkIn,checkOut).then(setRooms).catch(e=>setError(getErrorMessage(e))).finally(()=>setLoading(false)); },[type,checkIn,checkOut]);
  useEffect(()=>{ if(!isAuthenticated)return; accountService.getMe().then(d=>setMembership({tier:d.membershipTier??"NONE",discount:d.membershipDiscountPercent??0})).catch(()=>{}); },[isAuthenticated]);
  const nights=Math.max(1,Math.round((new Date(`${checkOut}T00:00:00`).getTime()-new Date(`${checkIn}T00:00:00`).getTime())/86400000));
  const estimate=selectedRoom?Math.max(0,selectedRoom.pricePerNight*nights*(1-(membership.discount/100))):0;
  const confirmBooking=(method:PaymentMethod)=>{ if(!selectedRoom)return; setSubmitting(true); setError(""); bookingService.create({roomId:selectedRoom.id,checkInDate:checkIn,checkOutDate:checkOut,guestCount,note:note.trim()||undefined,paymentMethod:method}).then(res=>{setResult({code:res.bookingCode,status:res.status});setPaymentOpen(false)}).catch(e=>setError(getErrorMessage(e,"Đặt phòng thất bại, vui lòng thử lại"))).finally(()=>setSubmitting(false)); };

  return <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface p-6">
        {result ? <div className="py-8 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">✓</div><h2 className="mt-4 font-display text-2xl text-ink">{result.status==="CONFIRMED"?"Đặt phòng thành công":"Đã giữ chỗ"}</h2><p className="mt-2 text-sm text-neutral-500">Mã đặt phòng: <b className="text-accent">#{result.code}</b></p>{result.status==="PENDING"&&<p className="mt-2 text-sm text-accent">Chỗ được giữ trong 2 giờ và đang chờ admin xác nhận.</p>}<div className="mt-6 flex justify-center gap-3"><button onClick={onClose} className="rounded-full border border-line px-5 py-2 text-sm">Đóng</button><button onClick={()=>{onClose();router.push("/dashboard")}} className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white">Xem lịch sử</button></div></div> : <>
          <div className="flex items-start justify-between"><div><p className="font-display text-sm italic text-accent">{formatDate(checkIn)} → {formatDate(checkOut)} · {nights} đêm</p><h2 className="mt-1 font-display text-xl text-ink">{typeLabel} còn trống</h2></div><button onClick={onClose} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100">✕</button></div>
          {loading&&<p className="mt-6 text-neutral-500">Đang tải...</p>}{!loading&&rooms.length===0&&<p className="mt-6 text-neutral-500">Không còn phòng trong khoảng ngày đã chọn.</p>}
          {!loading&&rooms.length>0&&<div className="mt-5 space-y-3">{rooms.map(room=>{const selected=selectedRoom?.id===room.id;return <button key={room.id} type="button" onClick={()=>{setSelectedRoom(room);setGuestCount(1)}} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left ${selected?"border-primary bg-primary/5":"border-line hover:border-primary/50"}`}><div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">{room.images?.[0]&&<img src={room.images[0]} alt={room.name} className="h-full w-full object-cover"/>}</div><div className="flex-1"><p className="font-medium text-ink">{room.name}</p><p className="text-xs text-neutral-500">Khuyến nghị {room.recommendedGuests} · tối đa {room.maxGuests} khách</p></div><p className="text-sm font-semibold text-accent">{formatPrice(room.pricePerNight)}/đêm</p></button>})}</div>}
          {selectedRoom&&<div className="mt-5 rounded-xl border border-line p-4"><div><label className="text-sm text-neutral-600">Số khách</label><div className="mt-2 flex items-center gap-3"><button type="button" onClick={()=>setGuestCount(Math.max(1,guestCount-1))} className="h-9 w-9 rounded-full border border-line">−</button><span className="w-8 text-center font-semibold">{guestCount}</span><button type="button" onClick={()=>setGuestCount(Math.min(selectedRoom.maxGuests,guestCount+1))} className="h-9 w-9 rounded-full border border-line">+</button><span className="text-xs text-neutral-400">Tối đa {selectedRoom.maxGuests}</span></div></div>{guestCount>(selectedRoom.recommendedGuests??0)&&<div className="mt-3 rounded-lg bg-accent/10 p-3 text-sm text-accent">Vượt {guestCount-(selectedRoom.recommendedGuests??0)} khách so với mức đề xuất. Phụ thu dự kiến: {formatPrice((selectedRoom.extraGuestFee??0)*(guestCount-(selectedRoom.recommendedGuests??0))*nights)}.</div>}<div className="mt-4"><label className="text-sm text-neutral-600">Yêu cầu / ghi chú</label><textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Ví dụ: nhận phòng muộn, kê thêm giường..." className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"/></div><div className="mt-4 rounded-xl bg-neutral-50 p-4"><div className="flex justify-between text-sm"><span>Giá tham khảo</span><b>{formatPrice(estimate)}</b></div>{membership.discount>0&&<p className="mt-1 text-xs text-primary">Membership {membership.tier} đang giảm {membership.discount}%. Giá cuối sẽ được máy chủ tính chính xác theo giá lễ/cuối tuần.</p>}</div>{error&&<p className="mt-3 text-sm text-red-600">{error}</p>}{!isAuthenticated&&!error&&<p className="mt-3 text-sm text-accent">Bạn cần <Link href="/login" className="underline">đăng nhập</Link> để đặt phòng.</p>}<button type="button" onClick={()=>{if(!isAuthenticated){onClose();router.push("/login");return;}if(!user?.emailVerified){setError("Vui lòng xác thực email trước khi đặt phòng");return;}setPaymentOpen(true)}} className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark">Xác nhận đặt phòng</button></div>}
        </>}
      </div>
    </div>
    <PaymentModal open={paymentOpen} onClose={()=>!submitting&&setPaymentOpen(false)} onConfirm={confirmBooking} totalPrice={estimate} loading={submitting}/>
  </>;
}
