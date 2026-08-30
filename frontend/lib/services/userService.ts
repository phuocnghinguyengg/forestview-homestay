import api from "@/lib/api";
import { Role, MembershipTier } from "@/types";

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  enabled: boolean;
  emailVerified: boolean;
  membershipTier: MembershipTier;
  membershipBookingCount: number;
  membershipTotalSpent: number;
  nextTierBookingThreshold: number;
  nextTierSpendingThreshold: number;
  membershipDiscountPercent: number;
  createdAt: string;
}

export interface AdminUserUpdatePayload {
  fullName: string;
  email: string;
  phone?: string;
}

export const userService = {
  getAll: () => api.get<AdminUser[]>("/admin/users").then((res) => res.data),
  update: (id: number, data: AdminUserUpdatePayload) =>
    api.put<AdminUser>(`/admin/users/${id}`, data).then((res) => res.data),
  toggleEnabled: (id: number) => api.patch(`/admin/users/${id}/toggle-enabled`),
  updateRole: (id: number, role: Role) => api.patch(`/admin/users/${id}/role?role=${role}`),
  remove: (id: number) => api.delete(`/admin/users/${id}`),
  grantMembership: (id: number, tier: MembershipTier) => api.patch(`/admin/users/${id}/membership`, { tier }).then((res) => res.data),
};