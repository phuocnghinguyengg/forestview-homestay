import api from "@/lib/api";
import { Role } from "@/types";

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export const userService = {
  getAll: () => api.get<AdminUser[]>("/admin/users").then((res) => res.data),
  toggleEnabled: (id: number) => api.patch(`/admin/users/${id}/toggle-enabled`),
  updateRole: (id: number, role: Role) => api.patch(`/admin/users/${id}/role?role=${role}`),
};