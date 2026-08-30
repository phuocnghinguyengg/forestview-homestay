"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { roomTypeService } from "@/lib/services/roomTypeService";
import { bookingService } from "@/lib/services/bookingService";
import { Room, RoomTypeCode } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";
import Link from "next/link";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

export default function RoomTypeBookingModal({
  type,
  typeLabel,
  checkIn,
  checkOut,
  onClose,
}: {
  type: RoomTypeCode;
  typeLabel: string;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);

  useEffect(() => {
    roomTypeService
      .getAvailableRooms(type, checkIn, checkOut)
      .then(setRooms)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [type, checkIn, checkOut]);

  const handleBook = async () => {
    if (!isAuthenticated) {
      onClose();
      router.push("/login");
      return;
    }
    if (!selectedRoom) return;

    setError("");
    setSubmitting(true);
    try {
      const res = await bookingService.create({
        roomId: selectedRoom.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount,
      });
      setBookingCode(res.bookingCode);
    } catch (err) {
      setError(getErrorMessage(err, "Đặt phòng thất bại, vui lòng thử lại"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6">
        {/* Trạng thái: đã đặt thành công */}
        {bookingCode ? (
          <div className="py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <span className="text-2xl text-primary">✓</span>
            </div>
            <h2 className="mt-4 font-display text-xl text-ink">Đặt phòng thành công!</h2>
            <p className="mt-2 text-sm text-neutral-500">
              Mã đặt phòng của bạn: <span className="font-semibold text-accent">#{bookingCode}</span>
            </p>
            <p className="mt-1 text-sm text-neutral-500">
              Chi tiết đã được gửi tới email của bạn. Trạng thái hiện tại: Chờ xác nhận.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={onClose}
                className="rounded-full border border-line px-5 py-2 text-sm hover:bg-neutral-50"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  onClose();
                  router.push("/dashboard");
                }}
                className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white hover:bg-primary-dark"
              >
                Xem lịch sử đặt phòng
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-sm italic text-accent">
                  {formatDate(checkIn)} → {formatDate(checkOut)}
                </p>
                <h2 className="mt-0.5 font-display text-xl text-ink">{typeLabel} còn trống</h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {loading && <p className="mt-6 text-neutral-500">Đang tải...</p>}

            {!loading && rooms.length === 0 && (
              <p className="mt-6 text-neutral-500">Không còn phòng loại này trong khoảng ngày đã chọn.</p>
            )}

            {!loading && rooms.length > 0 && (
              <div className="mt-5 space-y-3">
                {rooms.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => {
                        setSelectedRoom(room);
                        setGuestCount(1);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                        isSelected ? "border-primary bg-primary/5" : "border-line hover:border-primary/50"
                      }`}
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                        {room.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={room.images[0]} alt={room.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-ink">{room.name}</p>
                        <p className="text-xs text-neutral-500">Tối đa {room.maxGuests} khách</p>
                      </div>
                      <p className="text-sm font-semibold text-accent">{formatPrice(room.pricePerNight)}</p>
                    </button>
                  );
                })}
              </div>
            )}

{selectedRoom && (
  <div className="mt-5 rounded-xl border border-line p-4">
    <label className="text-sm text-neutral-600">Số khách</label>
    <input
      type="number"
      min={1}
      max={selectedRoom.maxGuests}
      value={guestCount}
      onChange={(e) => setGuestCount(Number(e.target.value))}
      className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-primary focus:outline-none"
    />

    {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

    {isAuthenticated && !useAuthStore.getState().user?.emailVerified && (
      <p className="mt-3 text-sm text-accent">
        Bạn cần xác thực email trước khi đặt phòng.{" "}
        <Link href="/verify-otp" className="underline">Xác thực ngay</Link>
      </p>
    )}

    <button
      onClick={handleBook}
      disabled={submitting || (isAuthenticated && !useAuthStore.getState().user?.emailVerified)}
      className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
    >
      {submitting
        ? "Đang xử lý..."
        : !isAuthenticated
          ? "Đăng nhập để đặt phòng"
          : !useAuthStore.getState().user?.emailVerified
            ? "Cần xác thực email"
            : "Xác nhận đặt phòng"}
    </button>
  </div>
)}
          </>
        )}
      </div>
    </div>
  );
}