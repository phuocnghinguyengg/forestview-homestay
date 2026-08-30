export type Role = "USER" | "ADMIN";

export interface AuthUser {
  fullName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  fullName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  images: string[];
  amenities: string[];
  active: boolean;
  type: RoomTypeCode;
  typeLabel: string;
  createdAt: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

export interface Booking {
  id: number;
  bookingCode: string;
  roomId: number;
  roomName: string;
  roomAddress: string;
  userFullName: string;
  userEmail: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: BookingStatus;
  note: string | null;
  createdAt: string;
  hasReview: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalRooms: number;
  activeRooms: number;
  totalBookings: number;
  bookingsByStatus: Record<BookingStatus, number>;
  totalRevenue: number;
  revenueThisMonth: number;
}

export type RoomTypeCode = "SINGLE" | "DOUBLE" | "FAMILY" | "DELUXE";

export interface RoomTypeAvailability {
  type: RoomTypeCode;
  label: string;
  totalRooms: number;
  availableRooms: number;
  minPrice: number | null;
  coverImage: string | null;
}

export interface RegisterResponse {
  message: string;
  email: string;
}