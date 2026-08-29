"use client";

import { useEffect, useState } from "react";
import { roomService } from "@/lib/services/roomService";
import { Room } from "@/types";
import RoomCard from "@/components/RoomCard";

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    roomService
      .getAll()
      .then(setRooms)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="bg-gradient-to-b from-rose-50 to-white px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
          Tìm homestay lý tưởng cho chuyến đi của bạn
        </h1>
        <p className="mt-3 text-neutral-600">
          Khám phá những homestay đẹp, đặt phòng nhanh chóng, trải nghiệm trọn vẹn.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-xl font-semibold text-neutral-900">Homestay nổi bật</h2>

        {loading && <p className="text-neutral-500">Đang tải danh sách phòng...</p>}

        {!loading && rooms.length === 0 && (
          <p className="text-neutral-500">Hiện chưa có homestay nào.</p>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>
    </main>
  );
}