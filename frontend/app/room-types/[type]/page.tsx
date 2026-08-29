"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { Room, RoomTypeCode } from "@/types";
import RoomCard from "@/components/RoomCard";
import { getErrorMessage } from "@/lib/getErrorMessage";

const TYPE_LABELS: Record<string, string> = {
  SINGLE: "Phòng đơn",
  DOUBLE: "Phòng đôi",
  FAMILY: "Phòng gia đình",
  DELUXE: "Phòng cao cấp",
};

export default function RoomsByTypePage() {
  const { type } = useParams<{ type: string }>();
  const searchParams = useSearchParams();
  const checkIn = searchParams.get("checkIn") ?? "";
  const checkOut = searchParams.get("checkOut") ?? "";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      <p className="font-display text-sm italic text-accent">
        {checkIn} → {checkOut}
      </p>
      <h1 className="mt-1 font-display text-3xl text-ink">
        {TYPE_LABELS[type] ?? type} còn trống
      </h1>

      {loading && <p className="mt-10 text-neutral-500">Đang tải...</p>}
      {error && <p className="mt-10 text-red-600">{error}</p>}

      {!loading && rooms.length === 0 && !error && (
        <p className="mt-10 text-neutral-500">Không còn phòng loại này trong khoảng ngày đã chọn.</p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </main>
  );
}