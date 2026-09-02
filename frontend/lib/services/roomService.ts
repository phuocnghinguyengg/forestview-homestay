import api from "@/lib/api";
import { PricePreview, Room, RoomTypeCode } from "@/types";

export const roomService = {
  getAll: () => api.get<Room[]>("/rooms").then((res) => res.data),
  getById: (id: number) => api.get<Room>(`/rooms/${id}`).then((res) => res.data),
  getPricePreview: (id: number, checkIn: string, checkOut: string, guestCount: number) =>
    api.get<PricePreview>(`/rooms/${id}/price-preview`, { params: { checkIn, checkOut, guestCount } }).then((res) => res.data),

  // Admin
  getAllAdmin: () => api.get<Room[]>("/admin/rooms").then((res) => res.data),
  create: (data: {
    name: string;
    description: string;
    address: string;
    pricePerNight: number;
    maxGuests: number;
    recommendedGuests: number;
    extraGuestFee: number;
    weekendPrice?: number;
    holidayPrice?: number;
    roomSize?: number;
    bedConfiguration?: string;
    viewDescription?: string;
    bathroomDescription?: string;
    floor?: string;
    checkInTime?: string;
    checkOutTime?: string;
    houseRules?: string;
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
    recommendedGuests: number;
    extraGuestFee: number;
    weekendPrice?: number;
    holidayPrice?: number;
    roomSize?: number;
    bedConfiguration?: string;
    viewDescription?: string;
    bathroomDescription?: string;
    floor?: string;
    checkInTime?: string;
    checkOutTime?: string;
    houseRules?: string;
    images: string[];
    amenities: string[];
    type: RoomTypeCode;
  }) =>
    api.put<Room>(`/admin/rooms/${id}`, data).then((res) => res.data),
  toggleActive: (id: number) => api.patch(`/admin/rooms/${id}/toggle-active`),
  remove: (id: number) => api.delete(`/admin/rooms/${id}`),
};
