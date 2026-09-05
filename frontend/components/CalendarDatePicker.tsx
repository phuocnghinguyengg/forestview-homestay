"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import DateRangeCalendar from "./DateRangeCalendar";

function format(value: string) {
  return new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export default function CalendarDatePicker({ value, onChange, minDate, label = "Chọn ngày" }: { value: string; onChange: (value: string) => void; minDate?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  return <div ref={ref} className="relative"><button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-3 py-2.5 text-left text-sm transition hover:border-primary"><span className={value ? "text-ink" : "text-neutral-400"}>{value ? format(value) : label}</span><CalendarDays size={17} className="text-primary" /></button>{open && <div className="absolute z-50 mt-2 w-[min(92vw,650px)] rounded-2xl bg-surface shadow-2xl"><DateRangeCalendar checkIn={value} checkOut="" minDate={minDate} onChange={(a, b) => { onChange(b || a); setOpen(false); }} /></div>}</div>;
}
