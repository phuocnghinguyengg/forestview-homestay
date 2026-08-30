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
  createdAt: string;
  membershipTier: MembershipTier;
  membershipLabel: string;
  membershipDiscountPercent: number;
  successfulBookingCount: number;
  successfulBookingTarget: number;
  successfulBookingProgressPercent: number;
  spendingVnd: number;
  spendingTargetVnd: number;
  spendingProgressPercent: number;
  nextMembershipTier?: MembershipTier | null;
  nextMembershipLabel?: string | null;
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
  updateMembership: (id: number, membershipTier: MembershipTier) => api.patch<AdminUser>(`/admin/users/${id}/membership`, { membershipTier }).then((res) => res.data),
  remove: (id: number) => api.delete(`/admin/users/${id}`),
};