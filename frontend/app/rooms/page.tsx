"use client";

import { useEffect, useState } from "react";
import { roomService } from "@/lib/services/roomService";
import { Room } from "@/types";
import RoomCard from "@/components/RoomCard";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roomService.getAll().then(setRooms).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-5 py-16">
      <p className="font-display text-sm italic text-accent">Đà Lạt, Lâm Đồng</p>
      <div className="mt-1 flex items-end justify-between border-b border-line pb-4">
        <h1 className="font-display text-3xl text-ink">Tất cả Homestay</h1>
        <span className="text-sm text-neutral-500">{rooms.length} địa điểm</span>
      </div>

      {loading && <p className="mt-10 text-neutral-500">Đang tải...</p>}

      {!loading && rooms.length === 0 && (
        <p className="mt-10 text-neutral-500">Hiện chưa có homestay nào được đăng.</p>
      )}

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </main>
  );
}