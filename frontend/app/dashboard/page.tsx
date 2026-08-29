"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { bookingService } from "@/lib/services/bookingService";
import { Booking } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

function DashboardContent() {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadBookings = () => {
    setLoading(true);
    bookingService
      .getMine()
      .then(setBookings)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn đặt phòng này?")) return;

    setCancellingId(id);
    try {
      await bookingService.cancel(id);
      loadBookings();
    } catch (err) {
      alert(getErrorMessage(err, "Không thể hủy đơn này"));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">Xin chào, {user?.fullName}</h1>
      <p className="mt-1 text-sm text-neutral-500">{user?.email}</p>

      <h2 className="mt-8 mb-4 text-lg font-semibold text-neutral-900">Lịch sử đặt phòng</h2>

      {loading && <p className="text-neutral-500">Đang tải...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && bookings.length === 0 && (
        <p className="text-neutral-500">Bạn chưa có đơn đặt phòng nào.</p>
      )}

      <div className="space-y-4">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-200 p-4 sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-semibold text-neutral-900">{b.roomName}</p>
              <p className="text-sm text-neutral-500">{b.roomAddress}</p>
              <p className="mt-1 text-sm text-neutral-600">
                {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)} · {b.guestCount} khách
              </p>
              <p className="mt-1 text-sm font-medium text-rose-600">{formatPrice(b.totalPrice)}</p>
            </div>

            <div className="flex items-center gap-3">
              <BookingStatusBadge status={b.status} />
              {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                <button
                  onClick={() => handleCancel(b.id)}
                  disabled={cancellingId === b.id}
                  className="rounded-full border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {cancellingId === b.id ? "Đang hủy..." : "Hủy đơn"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}