"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { RoomTypeAvailability } from "@/types";
import { getErrorMessage } from "@/lib/getErrorMessage";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function RoomTypesPage() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState(todayISO());
  const [checkOut, setCheckOut] = useState(tomorrowISO());
  const [results, setResults] = useState<RoomTypeAvailability[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    if (!checkIn || !checkOut || checkOut <= checkIn) {
      setError("Vui lòng chọn ngày trả phòng sau ngày nhận phòng");
      return;
    }

    setLoading(true);
    try {
      const data = await roomTypeService.getAvailability(checkIn, checkOut);
      setResults(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const goToType = (type: string) => {
    router.push(`/room-types/${type}?checkIn=${checkIn}&checkOut=${checkOut}`);
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-16">
      <p className="font-display text-sm italic text-accent">Đà Lạt, Lâm Đồng</p>
      <h1 className="mt-1 font-display text-3xl text-ink">Chọn loại phòng</h1>
      <p className="mt-2 text-neutral-600">Chọn ngày để xem loại phòng nào còn trống.</p>

      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-sm text-neutral-600">Nhận phòng</label>
          <input
            type="date"
            value={checkIn}
            min={todayISO()}
            onChange={(e) => setCheckIn(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <div className="flex-1">
          <label className="text-sm text-neutral-600">Trả phòng</label>
          <input
            type="date"
            value={checkOut}
            min={checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="mt-1 w-full rounded-lg border border-line px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? "Đang tìm..." : "Tìm phòng"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {results && (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {results.map((rt) => {
            const soldOut = rt.availableRooms === 0;
            return (
              <button
                key={rt.type}
                onClick={() => !soldOut && goToType(rt.type)}
                disabled={soldOut}
                className={`flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 text-left transition ${
                  soldOut ? "cursor-not-allowed opacity-50" : "hover:border-primary hover:shadow-sm"
                }`}
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-t-2xl rounded-b-md bg-neutral-100">
                  {rt.coverImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={rt.coverImage} alt={rt.label} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg text-ink">{rt.label}</h3>
                  {rt.minPrice && (
                    <p className="text-sm font-medium text-accent">
                      Từ {formatPrice(rt.minPrice)}
                      <span className="text-xs font-normal text-neutral-400"> /đêm</span>
                    </p>
                  )}
                  <p className="mt-1 text-sm text-neutral-500">
                    {soldOut ? "Đã hết phòng" : `Còn ${rt.availableRooms}/${rt.totalRooms} phòng`}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    soldOut ? "bg-neutral-100 text-neutral-500" : "bg-primary/10 text-primary"
                  }`}
                >
                  {soldOut ? "Hết phòng" : "Còn phòng"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
}