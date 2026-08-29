import api from "@/lib/api";
import { Booking, BookingStatus } from "@/types";

export const bookingService = {
  create: (data: { roomId: number; checkInDate: string; checkOutDate: string; guestCount: number; note?: string }) =>
    api.post<Booking>("/bookings", data).then((res) => res.data),

  getMine: () => api.get<Booking[]>("/bookings/me").then((res) => res.data),

  cancel: (id: number) => api.patch(`/bookings/${id}/cancel`),

  // Admin
  getAllAdmin: () => api.get<Booking[]>("/admin/bookings").then((res) => res.data),
  updateStatus: (id: number, status: BookingStatus) =>
    api.patch(`/admin/bookings/${id}/status?status=${status}`),
};