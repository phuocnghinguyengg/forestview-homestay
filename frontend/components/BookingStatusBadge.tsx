import { BookingStatus } from "@/types";

const STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-lantern/15 text-lantern-dark",
  CONFIRMED: "bg-primary/10 text-primary",
  CANCELLED: "bg-rose/10 text-rose-dark",
  COMPLETED: "bg-primary text-white",
};

const LABELS: Record<BookingStatus, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`rounded-none px-3 py-1 text-xs font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
