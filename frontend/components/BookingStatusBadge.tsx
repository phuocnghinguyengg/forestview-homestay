import { BookingStatus } from "@/types";

const STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-green-100 text-green-700",
  CANCELLED: "bg-neutral-100 text-neutral-500",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const LABELS: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}