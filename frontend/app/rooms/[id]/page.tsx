"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { roomService } from "@/lib/services/roomService";
import { bookingService } from "@/lib/services/bookingService";
import { Room } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { isAxiosError } from "axios";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [room, setRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    roomService.getById(Number(id)).then(setRoom).catch(console.error);
  }, [id]);

  const handleBooking = async () => {
    setError("");
    setSuccess(false);

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Vui lòng chọn ngày nhận và trả phòng");
      return;
    }

    setSubmitting(true);
    try {
      await bookingService.create({
        roomId: Number(id),
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount: guests,
      });
      setSuccess(true);
    } catch (err) {
      setError(getErrorMessage(err, "Đặt phòng thất bại. Vui lòng thử lại."));
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) return <main className="p-8 text-neutral-500">Đang tải...</main>;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">{room.name}</h1>
      <p className="mt-1 text-neutral-500">{room.address}</p>

      <div className="mt-4 h-72 w-full overflow-hidden rounded-2xl bg-neutral-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={room.images?.[0] ?? "/placeholder-room.jpg"}
          alt={room.name}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <h2 className="text-lg font-semibold">Mô tả</h2>
          <p className="mt-2 text-neutral-600">{room.description || "Chưa có mô tả."}</p>

          <h2 className="mt-6 text-lg font-semibold">Tiện ích</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {room.amenities.map((a) => (
              <li key={a} className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700">
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-200 p-4">
          <p className="text-xl font-bold text-rose-600">
            {formatPrice(room.pricePerNight)} <span className="text-sm font-normal text-neutral-400">/đêm</span>
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm text-neutral-600">Nhận phòng</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Trả phòng</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Số khách</label>
              <input
                type="number"
                min={1}
                max={room.maxGuests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {success && <p className="mt-3 text-sm text-green-600">Đặt phòng thành công!</p>}

          <button
            onClick={handleBooking}
            disabled={submitting}
            className="mt-4 w-full rounded-full bg-rose-600 py-2.5 font-medium text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {submitting ? "Đang xử lý..." : "Đặt phòng ngay"}
          </button>
        </div>
      </div>
    </main>
  );
}