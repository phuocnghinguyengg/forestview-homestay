export type Role = "USER" | "ADMIN";

export type MembershipTier = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "DIAMOND";

export interface AuthUser {
  fullName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  membershipTier?: MembershipTier;
  membershipLabel?: string;
  membershipDiscountPercent?: number;
  successfulBookingCount?: number;
  successfulBookingTarget?: number;
  successfulBookingProgressPercent?: number;
  spendingVnd?: number;
  spendingTargetVnd?: number;
  spendingProgressPercent?: number;
  nextMembershipTier?: MembershipTier | null;
  nextMembershipLabel?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  fullName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  membershipTier?: MembershipTier;
  membershipLabel?: string;
  membershipDiscountPercent?: number;
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
  recommendedGuests: number;
  extraGuestFeePerNight: number;
  weekendPrice?: number | null;
  holidayPrice?: number | null;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentMethod = "CASH" | "QR_CODE" | "CARD" | "HOLD";
export type PaymentStatus = "UNPAID" | "PAID" | "HOLD";

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
  nights: number;
  basePrice: number;
  holidayPriceTotal: number;
  extraGuestFee: number;
  membershipDiscountAmount: number;
  membershipDiscountPercent: number;
  membershipTierApplied?: MembershipTier | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentHoldExpiresAt?: string | null;
  rejectionReason?: string | null;
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