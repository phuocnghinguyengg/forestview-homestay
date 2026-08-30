"use client";

import { useMemo, useState } from "react";

type Props = { checkIn: string; checkOut: string; minDate?: string; onChange: (checkIn: string, checkOut: string) => void };

const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth()+n, 1);
const monthLabel = (d: Date) => d.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

function Month({ month, checkIn, checkOut, minDate, onPick }: { month: Date; checkIn: string; checkOut: string; minDate: string; onPick: (v:string)=>void }) {
  const cells = useMemo(() => {
    const first = startOfMonth(month);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(first.getFullYear(), first.getMonth()+1, 0).getDate();
    return Array.from({ length: offset + days }, (_, i) => i < offset ? null : new Date(first.getFullYear(), first.getMonth(), i-offset+1));
  }, [month]);

  return <div className="min-w-[290px] flex-1">
    <div className="mb-4 text-center font-semibold text-ink">{monthLabel(month)}</div>
    <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-neutral-400">
      {['T2','T3','T4','T5','T6','T7','CN'].map(x => <span key={x}>{x}</span>)}
    </div>
    <div className="mt-2 grid grid-cols-7 gap-y-1 text-center">
      {cells.map((d, i) => {
        if (!d) return <span key={`e-${i}`} className="h-10" />;
        const value = iso(d);
        const disabled = value < minDate;
        const selectedStart = value === checkIn;
        const selectedEnd = value === checkOut;
        const inRange = !!checkIn && !!checkOut && value > checkIn && value < checkOut;
        return <button key={value} type="button" disabled={disabled} onClick={() => onPick(value)} className={`relative h-10 rounded-full text-sm transition ${disabled ? 'cursor-not-allowed text-neutral-300' : 'text-ink hover:bg-primary/10'} ${inRange ? 'rounded-none bg-primary/10' : ''} ${selectedStart || selectedEnd ? 'bg-primary font-semibold text-white hover:bg-primary' : ''}`}>
          {d.getDate()}
        </button>;
      })}
    </div>
  </div>;
}

export default function DateRangeCalendar({ checkIn, checkOut, minDate = iso(new Date()), onChange }: Props) {
  const initial = checkIn ? startOfMonth(new Date(`${checkIn}T00:00:00`)) : startOfMonth(new Date());
  const [cursor, setCursor] = useState(initial);

  const pick = (value: string) => {
    if (!checkIn || (checkIn && checkOut)) { onChange(value, ""); return; }
    if (value <= checkIn) { onChange(value, checkOut); return; }
    onChange(checkIn, value);
  };

  return <div className="w-full rounded-2xl border border-line bg-surface p-5 shadow-xl">
    <div className="mb-4 flex items-center justify-between">
      <button type="button" onClick={() => setCursor(addMonths(cursor, -1))} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Tháng trước">‹</button>
      <div className="text-xs font-medium text-neutral-500">{checkIn && !checkOut ? 'Chọn ngày trả phòng' : 'Chọn ngày nhận phòng và trả phòng'}</div>
      <button type="button" onClick={() => setCursor(addMonths(cursor, 1))} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Tháng sau">›</button>
    </div>
    <div className="flex gap-6 overflow-x-auto">
      <Month month={cursor} checkIn={checkIn} checkOut={checkOut} minDate={minDate} onPick={pick}/>
      <Month month={addMonths(cursor, 1)} checkIn={checkIn} checkOut={checkOut} minDate={minDate} onPick={pick}/>
    </div>
    <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-sm">
      <span className="text-neutral-500">{checkIn ? new Date(`${checkIn}T00:00:00`).toLocaleDateString('vi-VN') : 'Nhận phòng'} → {checkOut ? new Date(`${checkOut}T00:00:00`).toLocaleDateString('vi-VN') : 'Trả phòng'}</span>
      {checkIn && checkOut && <span className="font-semibold text-primary">{Math.max(0, Math.round((new Date(`${checkOut}T00:00:00`).getTime()-new Date(`${checkIn}T00:00:00`).getTime())/86400000))} đêm</span>}
    </div>
  </div>;
}
