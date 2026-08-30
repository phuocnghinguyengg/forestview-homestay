"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getErrorMessage } from "@/lib/getErrorMessage";

type Holiday={id:number;date:string;name:string};
function money(v:number){return new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND"}).format(v)}
export default function AdminHolidaysPage(){
 const [items,setItems]=useState<Holiday[]>([]); const [date,setDate]=useState(""); const [name,setName]=useState(""); const [rooms,setRooms]=useState<any[]>([]); const [loading,setLoading]=useState(true);
 const load=()=>{setLoading(true);Promise.all([api.get<Holiday[]>("/admin/holidays"),api.get<any[]>("/admin/rooms")]).then(([h,r])=>{setItems(h.data);setRooms(r.data)}).catch(e=>alert(getErrorMessage(e))).finally(()=>setLoading(false))};
 useEffect(load,[]);
 const add=async(e:React.FormEvent)=>{e.preventDefault();try{await api.post("/admin/holidays",{date,name});setDate("");setName("");load()}catch(e){alert(getErrorMessage(e,"Không thể thêm ngày lễ"))}};
 const del=async(id:number)=>{if(!confirm("Xóa ngày lễ này?"))return;try{await api.delete(`/admin/holidays/${id}`);load()}catch(e){alert(getErrorMessage(e))}};
 return <div><h1 className="font-display text-2xl text-ink">Ngày lễ & giá lễ</h1><p className="mt-2 text-sm text-neutral-500">Ngày lễ quyết định khi nào hệ thống dùng giá ngày lễ. Giá ngày lễ được cập nhật trực tiếp trong phần Sửa phòng.</p>
  <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-line bg-surface p-5"><h2 className="font-display text-lg">Thêm ngày lễ</h2><form onSubmit={add} className="mt-4 space-y-3"><input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"/><input required placeholder="Tên ngày lễ" value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-lg border border-line px-3 py-2.5 text-sm"/><button className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white">Thêm ngày lễ</button></form><div className="mt-5 space-y-2">{items.map(x=><div key={x.id} className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3"><span><b>{new Date(`${x.date}T00:00:00`).toLocaleDateString('vi-VN')}</b> · {x.name}</span><button onClick={()=>del(x.id)} className="text-sm text-red-600">Xóa</button></div>)}{!loading&&!items.length&&<p className="text-sm text-neutral-500">Chưa có ngày lễ.</p>}</div></section>
  <section className="rounded-2xl border border-line bg-surface p-5"><h2 className="font-display text-lg">Giá lễ hiện tại theo phòng</h2><p className="mt-1 text-sm text-neutral-500">Bấm “Sửa” ở Quản lý phòng để cập nhật giá. Giá mới sẽ được dùng ngay cho booking mới.</p><div className="mt-4 space-y-2">{rooms.map(r=><div key={r.id} className="flex items-center justify-between rounded-xl border border-line px-4 py-3"><div><b>{r.name}</b><p className="text-xs text-neutral-500">Giá thường: {money(r.pricePerNight)} · Giá lễ: {r.holidayPrice?money(r.holidayPrice):'Chưa đặt'}</p></div><a href="/admin/rooms" className="text-sm font-medium text-primary">Sửa</a></div>)}</div></section></div>
 </div>
}
