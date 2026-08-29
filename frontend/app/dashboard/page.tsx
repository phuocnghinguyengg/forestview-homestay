"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { bookingService } from "@/lib/services/bookingService";
import { Booking } from "@/types";
import { useAuthStore } from "@/hooks/useAuthStore";
import { getErrorMessage } from "@/lib/getErrorMessage";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
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

  // Dùng để reload danh sách sau khi hủy booking.
  const loadBookings = async () => {
    setLoading(true);

    try {
      const data = await bookingService.getMine();

      setBookings(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Load booking lần đầu khi mở Dashboard.
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getMine();

        setBookings(data);
        setError("");
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void fetchBookings();
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn đặt phòng này?")) {
      return;
    }

    setCancellingId(id);

    try {
      await bookingService.cancel(id);

      await loadBookings();
    } catch (err) {
      alert(getErrorMessage(err, "Không thể hủy đơn này"));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900">
        Xin chào, {user?.fullName}
      </h1>

      <p className="mt-1 text-sm text-neutral-500">
        {user?.email}
      </p>

      <h2 className="mb-4 mt-8 text-lg font-semibold text-neutral-900">
        Lịch sử đặt phòng
      </h2>

      {loading && (
        <p className="text-neutral-500">
          Đang tải...
        </p>
      )}

      {error && (
        <p className="text-red-600">
          {error}
        </p>
      )}

      {!loading && bookings.length === 0 && !error && (
        <p className="text-neutral-500">
          Bạn chưa có đơn đặt phòng nào.
        </p>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="flex flex-col justify-between gap-3 rounded-2xl border border-neutral-200 p-4 sm:flex-row sm:items-center"
          >
            <div>
              <p className="font-semibold text-neutral-900">
                {booking.roomName}
              </p>

              <p className="text-sm text-neutral-500">
                {booking.roomAddress}
              </p>

              <p className="mt-1 text-sm text-neutral-600">
                {formatDate(booking.checkInDate)} →{" "}
                {formatDate(booking.checkOutDate)} ·{" "}
                {booking.guestCount} khách
              </p>

              <p className="mt-1 text-sm font-medium text-rose-600">
                {formatPrice(booking.totalPrice)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <BookingStatusBadge status={booking.status} />

              {(booking.status === "PENDING" ||
                booking.status === "CONFIRMED") && (
                <button
                  type="button"
                  onClick={() => handleCancel(booking.id)}
                  disabled={cancellingId === booking.id}
                  className="rounded-full border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {cancellingId === booking.id
                    ? "Đang hủy..."
                    : "Hủy đơn"}
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