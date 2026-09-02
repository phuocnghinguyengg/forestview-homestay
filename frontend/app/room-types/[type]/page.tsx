"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { Room, RoomTypeCode } from "@/types";
import RoomCard from "@/components/RoomCard";
import { getErrorMessage } from "@/lib/getErrorMessage";

const TYPE_LABELS: Record<string, string> = {
  STANDARD: "Standard Room",
  SUPERIOR: "Superior Room",
  DELUXE: "Deluxe Room",
  SUITE: "Suite Room",
};

function getNights(a: string, b: string) {
  if (!a || !b) return 1;
  const start = new Date(`${a}T00:00:00`).getTime();
  const end = new Date(`${b}T00:00:00`).getTime();
  return Math.max(1, Math.round((end - start) / 86400000));
}

function formatDate(date: string) {
  if (!date) return "";
  return new Date(`${date}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function RoomsByTypePage() {
  const { type } = useParams<{ type: string }>();
  const searchParams = useSearchParams();
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);

  useEffect(() => {
    if (!checkIn || !checkOut) return;

    roomTypeService
      .getAvailableRooms(type as RoomTypeCode, checkIn, checkOut)
      .then(setRooms)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [type, checkIn, checkOut]);

  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-display text-sm italic text-accent">
            {checkIn && checkOut ? `${formatDate(checkIn)} → ${formatDate(checkOut)} · ${nights} đêm` : "Đà Lạt, Lâm Đồng"}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink sm:text-4xl">
            {TYPE_LABELS[type] ?? type}
          </h1>
        </div>
        {rooms.length > 0 && (
          <span className="text-sm text-neutral-500 font-medium">
            {rooms.length} phòng khả dụng · {nights} đêm lưu trú
          </span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-neutral-500">
          <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-line border-t-primary" />
          Đang tìm phòng còn trống...
        </div>
      )}
      {error && <p className="mt-10 text-red-600">{error}</p>}

      {!loading && rooms.length === 0 && !error && (
        <div className="mt-10 rounded-3xl border border-line bg-surface p-12 text-center text-neutral-500">
          Không còn phòng loại này trong khoảng ngày đã chọn ({nights} đêm).
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} nights={nights} checkIn={checkIn} checkOut={checkOut} />
        ))}
      </div>
    </main>
  );
}

