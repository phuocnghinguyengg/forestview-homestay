import api from "@/lib/api";
import { Room, RoomTypeAvailability, RoomTypeCode } from "@/types";

export const roomTypeService = {
  getAvailability: (checkIn: string, checkOut: string, guestCount = 1) =>
    api
      .get<RoomTypeAvailability[]>("/room-types", { params: { checkIn, checkOut, guestCount } })
      .then((res) => res.data),

  getAvailableRooms: (type: RoomTypeCode, checkIn: string, checkOut: string, guestCount = 1) =>
    api
      .get<Room[]>(`/room-types/${type}/rooms`, { params: { checkIn, checkOut, guestCount } })
      .then((res) => res.data),
};