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
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await bookingService.getAllAdmin();
        setBookings(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => controller.abort();
  }, []);

  const handleStatusChange = async (id: number, status: BookingStatus) => {
    let reason: string | undefined;
    if (status === "CANCELLED") {
      const value = window.prompt("Nhập lý do từ chối đơn:");
      if (value === null) return;
      reason = value.trim();
      if (!reason) { alert("Vui lòng nhập lý do từ chối"); return; }
    }
    setUpdatingId(id);
    try {
      await bookingService.updateStatus(id, status, reason);
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
      <h1 className="font-display text-2xl text-ink">Đơn đặt phòng</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            filter === "ALL" ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          Tất cả ({bookings.length})
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              filter === s ? "bg-primary text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
          <div key={b.id} className="rounded-2xl border border-line bg-surface p-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                {b.bookingCode && <p className="font-display text-xs italic text-accent">#{b.bookingCode}</p>}
                <p className="mt-0.5 font-medium text-ink">{b.roomName}</p>
                <p className="text-sm text-neutral-500">{b.roomAddress}</p>
                <p className="mt-1 text-sm text-neutral-600">
                  Khách: {b.userFullName} ({b.userEmail})
                </p>
                <p className="mt-1 text-sm text-neutral-600">
                  {formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)} · {b.guestCount} khách
                </p>
                {b.note && <p className="mt-1 text-sm italic text-neutral-500">Ghi chú: {b.note}</p>}
                <p className="mt-1 text-sm text-neutral-500">{b.nights} đêm · Thanh toán: {b.paymentMethod === "HOLD" ? "Giữ thanh toán" : b.paymentMethod === "QR_CODE" ? "QR Code" : b.paymentMethod === "CARD" ? "NAPAS/VISA/MasterCard" : "Tiền mặt"}</p>
                {b.membershipDiscountAmount ? <p className="mt-1 text-xs text-primary">Membership -{b.membershipDiscountPercent}%: -{formatPrice(b.membershipDiscountAmount)}</p> : null}
                {b.rejectionReason && <p className="mt-1 text-sm text-red-600">Lý do: {b.rejectionReason}</p>}
                <p className="mt-1 text-sm font-medium text-accent">{formatPrice(b.totalPrice)}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <BookingStatusBadge status={b.status} />
                <select
                  value={b.status}
                  disabled={updatingId === b.id}
                  onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                  className="rounded-lg border border-line px-2 py-1 text-sm focus:border-primary focus:outline-none"
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