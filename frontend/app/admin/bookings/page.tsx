"use client";

import { useEffect, useState } from "react";
import { bookingService } from "@/lib/services/bookingService";
import { Booking, BookingStatus } from "@/types";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { getErrorMessage } from "@/lib/getErrorMessage";

function formatPrice(price: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN");
}

const STATUS_OPTIONS: BookingStatus[] = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const loadBookings = () => {
    setLoading(true);
    bookingService
      .getAllAdmin()
      .then(setBookings)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleStatusChange = async (id: number, status: BookingStatus) => {
    setUpdatingId(id);
    try {
      await bookingService.updateStatus(id, status);
      loadBookings();
    } catch (err) {
      alert(getErrorMessage(err, "Không thể cập nhật trạng thái"));
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === "ALL" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-neutral-900">Đơn đặt phòng</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
            filter === "ALL" ? "bg-rose-600 text-white" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          Tất cả ({bookings.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium ${
              filter === s ? "bg-rose-600 text-white" : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {STATUS_LABELS[s]} ({bookings.filter((b) => b.status === s).length})
          </button>
        ))}
      </div>

      {loading && <p className="mt-6 text-neutral-500">Đang tải...</p>}
      {error && <p className="mt-6 text-red-600">{error}</p>}

      <div className="mt-6 space-y-4">
        {filtered.map((b) => (
          <div key={b.id} className="rounded-2xl border border-neutral-200 p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <p className="font-semibold text-neutral-900">{b.roomName}</p>
                <p className="text-sm text-neutral-500">{b.roomAddress}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Khách: {b.userFullName} ({b.userEmail})
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)} · {b.guestCount} khách
                </p>
                {b.note && <p className="mt-1 text-sm italic text-neutral-500">Ghi chú: {b.note}</p>}
                <p className="mt-1 text-sm font-medium text-rose-600">{formatPrice(b.totalPrice)}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <BookingStatusBadge status={b.status} />
                <select
                  value={b.status}
                  disabled={updatingId === b.id}
                  onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                  className="rounded-lg border border-neutral-300 px-2 py-1 text-sm"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        {!loading && filtered.length === 0 && (
          <p className="text-neutral-500">Không có đơn nào ở trạng thái này.</p>
        )}
      </div>
    </div>
  );
}