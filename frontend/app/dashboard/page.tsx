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

  const loadBookings = async () => {
    const data = await bookingService.getMine();
    setBookings(data);
  };

  useEffect(() => {
    let cancelled = false;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await bookingService.getMine();

        if (!cancelled) {
          setBookings(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setBookings([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBookings();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn hủy đơn đặt phòng này?")) {
      return;
    }

    setCancellingId(id);

    try {
      await bookingService.cancel(id);

      setError("");

      await loadBookings();
    } catch (err) {
      alert(getErrorMessage(err, "Không thể hủy đơn này"));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-5 py-16">
      <p className="font-display text-sm italic text-accent">
        Tài khoản của tôi
      </p>

      <h1 className="mt-1 font-display text-3xl text-ink">
        Xin chào, {user?.fullName}
      </h1>

      <p className="mt-2 text-neutral-500">{user?.email}</p>

      <div className="mt-10 flex items-end justify-between border-b border-line pb-4">
        <h2 className="font-display text-xl text-ink">
          Lịch sử đặt phòng
        </h2>

        <span className="text-sm text-neutral-500">
          {bookings.length} đơn
        </span>
      </div>

      {loading && (
        <p className="mt-6 text-neutral-500">
          Đang tải...
        </p>
      )}

      {error && (
        <p className="mt-6 text-red-600">
          {error}
        </p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <p className="mt-6 text-neutral-500">
          Bạn chưa có đơn đặt phòng nào.
        </p>
      )}

      {!loading && bookings.length > 0 && (
        <div className="mt-6 space-y-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="flex flex-col justify-between gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center"
            >
              <div>
                {b.bookingCode && (
                  <p className="font-display text-xs italic text-accent">
                    #{b.bookingCode}
                  </p>
                )}

                <p className="mt-0.5 font-display text-lg text-ink">
                  {b.roomName}
                </p>

                <p className="text-sm text-neutral-500">
                  {b.roomAddress}
                </p>

                <p className="mt-1 text-sm text-neutral-600">
                  {formatDate(b.checkInDate)} →{" "}
                  {formatDate(b.checkOutDate)} · {b.guestCount} khách
                </p>

                <p className="mt-1 text-sm font-medium text-accent">
                  {formatPrice(b.totalPrice)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <BookingStatusBadge status={b.status} />

                {(b.status === "PENDING" ||
                  b.status === "CONFIRMED") && (
                  <button
                    onClick={() => handleCancel(b.id)}
                    disabled={cancellingId === b.id}
                    className="rounded-full border border-line px-3 py-1.5 text-sm text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                  >
                    {cancellingId === b.id
                      ? "Đang hủy..."
                      : "Hủy đơn"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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