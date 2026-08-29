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
      .catch((error) => {
        console.error("Failed to load rooms:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main>
      <section className="relative overflow-hidden px-5 py-24 text-center sm:py-32">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/[0.06] to-transparent" />

        <p className="font-display text-sm italic tracking-wide text-accent">
          Vinh, Nghệ An
        </p>

        <h1 className="mx-auto mt-3 max-w-2xl font-display text-4xl leading-tight text-ink sm:text-6xl">
          Chốn dừng chân giữa lòng phố Vinh
        </h1>

        <p className="mx-auto mt-5 max-w-md text-neutral-600">
          Những homestay được chọn lọc kỹ càng, không gian ấm cúng, đặt phòng
          chỉ trong vài phút.
        </p>

        <div className="mt-8">
          <a
            href="#rooms"
            className="inline-block rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Khám phá homestay
          </a>
        </div>
      </section>

      <section id="rooms" className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 flex items-end justify-between border-b border-line pb-4">
          <h2 className="font-display text-2xl text-ink">
            Homestay nổi bật
          </h2>

          <span className="text-sm text-neutral-500">
            {rooms.length} địa điểm
          </span>
        </div>

        {loading && (
          <p className="text-neutral-500">
            Đang tải danh sách phòng...
          </p>
        )}

        {!loading && rooms.length === 0 && (
          <p className="text-neutral-500">
            Hiện chưa có homestay nào được đăng.
          </p>
        )}

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>
    </main>
  );
}