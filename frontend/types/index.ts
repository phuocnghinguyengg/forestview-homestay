export type Role = "USER" | "ADMIN";
export type MembershipTier = "NONE" | "BRONZE" | "SILVER" | "GOLD" | "DIAMOND";
export type PaymentMethod = "CASH" | "QR_CODE" | "CARD" | "HOLD";
export type PaymentStatus = "UNPAID" | "PAID" | "HOLD";

export interface AuthUser {
  fullName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  membershipTier?: MembershipTier;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  fullName: string;
  email: string;
  role: Role;
  emailVerified: boolean;
  membershipTier?: MembershipTier;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  address: string;
  pricePerNight: number;
  maxGuests: number;
  recommendedGuests: number;
  extraGuestFee: number;
  weekendPrice?: number | null;
  holidayPrice?: number | null;
  roomSize?: number | null;
  bedConfiguration?: string | null;
  viewDescription?: string | null;
  bathroomDescription?: string | null;
  floor?: string | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  houseRules?: string | null;
  quotedStayPrice?: number | null;
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
  nights: number;
  guestCount: number;
  basePrice?: number | null;
  holidayPrice?: number | null;
  extraGuestFee?: number | null;
  membershipDiscountPercent?: number | null;
  membershipDiscountAmount?: number | null;
  discountCode?: string | null;
  discountCodePercent?: number | null;
  discountCodeAmount?: number | null;
  totalPrice: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
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

export type RoomTypeCode = "STANDARD" | "SUPERIOR" | "DELUXE" | "SUITE";

export interface RoomTypeAvailability {
  type: RoomTypeCode;
  label: string;
  totalRooms: number;
  availableRooms: number;
  minPrice: number | null;
  coverImage: string | null;
}

export interface PricePreview {
  checkIn: string;
  checkOut: string;
  nights: number;
  weekdaySubtotal: number;
  weekendSubtotal: number;
  holidaySubtotal: number;
  weekdayNights: number;
  weekendNights: number;
  holidayNights: number;
  extraGuestSubtotal: number;
  totalBeforeDiscount: number;
}

export interface Review {
  id: number;
  bookingId: number;
  userFullName: string;
  roomName: string;
  roomTypeLabel: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
}

export interface RegisterResponse {
  message: string;
  email: string;
}

export interface DiscountCode {
  id: number;
  code: string;
  percent: number;
  description: string | null;
  startAt: string;
  endAt: string;
  active: boolean;
  createdAt: string;
}

export interface DiscountCodePreview {
  code: string;
  percent: number;
  valid: boolean;
}
