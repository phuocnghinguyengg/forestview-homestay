"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

function iso(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function parse(value: string) { const [y,m,d]=value.split("-").map(Number); return new Date(y,m-1,d); }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); }
const months = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const weekdays = ["T2","T3","T4","T5","T6","T7","CN"];

// Số đêm giữa 2 ngày, luôn >= 0, không bao giờ trả về số âm dù dữ liệu đầu vào có bị đảo ngược.
function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const diff = Math.round((parse(checkOut).getTime() - parse(checkIn).getTime()) / 86400000);
  return Math.max(0, diff);
}

export default function DateRangeCalendar({ checkIn, checkOut, onChange, minDate }: { checkIn: string; checkOut: string; onChange: (a:string,b:string)=>void; minDate?: string }) {
  const today = minDate ? parse(minDate) : new Date();
  const [cursor, setCursor] = useState(startOfMonth(today));
  const second = new Date(cursor.getFullYear(), cursor.getMonth()+1, 1);
  const selectedStart = checkIn ? parse(checkIn) : null;
  const selectedEnd = checkOut ? parse(checkOut) : null;

  // Bước hiện tại: chưa có ngày nhận -> chọn ngày nhận; đã có ngày nhận nhưng chưa có ngày trả -> chọn ngày trả.
  const pickingCheckOut = Boolean(checkIn) && !checkOut;

  const handleSelect = (value: string) => {
    // Chưa chọn gì, hoặc đã có đủ cặp ngày trước đó -> bắt đầu lượt chọn mới, xoá sạch ngày trả cũ.
    if (!checkIn || (checkIn && checkOut)) {
      onChange(value, "");
      return;
    }

    // Đang ở bước chọn ngày trả: ngày bấm phải sau ngày nhận, nếu không thì coi như chọn lại ngày nhận.
    if (value > checkIn) {
      onChange(checkIn, value);
    } else if (value < checkIn) {
      onChange(value, "");
    }
    // value === checkIn: bấm trùng ngày nhận, bỏ qua để tránh chọn 0 đêm.
  };

  const renderMonth = (month: Date) => {
    const first = startOfMonth(month); const offset = (first.getDay()+6)%7; const count=daysInMonth(month);
    const cells = Array.from({length: offset+count},(_,i)=>i<offset?null:i-offset+1);
    return <div className="min-w-[280px] flex-1">
      <div className="mb-3 text-center font-semibold text-ink">{months[month.getMonth()]} {month.getFullYear()}</div>
      <div className="grid grid-cols-7 text-center text-xs text-neutral-400">{weekdays.map(w=><div key={w} className="py-2">{w}</div>)}</div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-sm">
        {cells.map((day,i)=>{
          if(day===null)return <div key={i}/>;
          const date=new Date(month.getFullYear(),month.getMonth(),day); const value=iso(date);
          const disabled=minDate ? value<minDate : false;
          const inRange=Boolean(selectedStart&&selectedEnd&&date>selectedStart&&date<selectedEnd);
          const start=checkIn===value; const end=checkOut===value;
          // Trong lúc đang chờ chọn ngày trả, làm mờ những ngày <= ngày nhận để dễ nhận biết ngày hợp lệ.
          const beforeCheckIn = pickingCheckOut && checkIn ? value <= checkIn : false;
          return <button
            aria-label={value}
            key={value}
            type="button"
            disabled={disabled}
            onClick={()=>handleSelect(value)}
            className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full transition ${
              disabled?"cursor-not-allowed text-neutral-200"
              : beforeCheckIn ? "text-neutral-300 hover:bg-primary/10"
              : "hover:bg-primary/10"
            } ${inRange?"rounded-none bg-primary/10 text-primary":""} ${start||end?"bg-primary font-semibold text-white shadow-sm hover:bg-primary-dark":""}`}
          >
            {day}
          </button>;
        })}
      </div>
    </div>;
  };

  const nights = nightsBetween(checkIn, checkOut);

  return <div className="rounded-2xl border border-line bg-surface p-4 shadow-sm">
    <div className="mb-4 flex items-center justify-between">
      <button aria-label="Tháng trước" type="button" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()-1,1))} className="rounded-full p-2 text-primary hover:bg-primary/10"><ChevronLeft size={18}/></button>
      <div className="text-sm font-medium text-neutral-600">
        {pickingCheckOut ? "Bước 2: chọn ngày trả phòng" : "Bước 1: chọn ngày nhận phòng"}
      </div>
      <button aria-label="Tháng sau" type="button" onClick={()=>setCursor(new Date(cursor.getFullYear(),cursor.getMonth()+1,1))} className="rounded-full p-2 text-primary hover:bg-primary/10"><ChevronRight size={18}/></button>
    </div>
    <div className="flex flex-col gap-6 md:flex-row">{renderMonth(cursor)}{renderMonth(second)}</div>
    <div className="mt-4 flex flex-wrap gap-2 text-sm">
      <span className="rounded-lg border border-line px-3 py-2">Nhận: <b>{checkIn || "—"}</b></span>
      <span className="rounded-lg border border-line px-3 py-2">Trả: <b>{checkOut || "—"}</b></span>
      {checkIn && checkOut && nights > 0 && (
        <span className="rounded-lg bg-primary/10 px-3 py-2 text-primary"><b>{nights}</b> đêm</span>
      )}
    </div>
  </div>;
}
