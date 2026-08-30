import api from "@/lib/api";
import { Room, RoomTypeCode } from "@/types";

export const roomService = {
  getAll: () => api.get<Room[]>("/rooms").then((res) => res.data),
  getById: (id: number) => api.get<Room>(`/rooms/${id}`).then((res) => res.data),

  // Admin
  getAllAdmin: () => api.get<Room[]>("/admin/rooms").then((res) => res.data),
  create: (data: {
    name: string;
    description: string;
    address: string;
    pricePerNight: number;
    maxGuests: number;
    images: string[];
    amenities: string[];
    type: RoomTypeCode;
  }) => api.post<Room>("/admin/rooms", data).then((res) => res.data),
  update: (id: number, data: {
    name: string;
    description: string;
    address: string;
    pricePerNight: number;
    maxGuests: number;
    images: string[];
    amenities: string[];
    type: RoomTypeCode;
  }) =>
    api.put<Room>(`/admin/rooms/${id}`, data).then((res) => res.data),
  toggleActive: (id: number) => api.patch(`/admin/rooms/${id}/toggle-active`),
  remove: (id: number) => api.delete(`/admin/rooms/${id}`),
};