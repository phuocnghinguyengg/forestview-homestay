import api from "@/lib/api";
import { AuthResponse, AuthUser } from "@/types";

export interface AccountUser extends AuthUser { id: number; phone: string | null; enabled: boolean; createdAt: string; }

export const accountService = {
  me: () => api.get<AccountUser>("/account/me").then((r) => r.data),
  updateProfile: (data: { fullName: string; phone?: string }) => api.put<AccountUser>("/account/profile", data).then((r) => r.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.put("/account/password", data),
  requestEmailChange: (data: { newEmail: string }) => api.post("/account/email/request", data),
  verifyEmailChange: (data: { newEmail: string; otp: string }) => api.post<AuthResponse>("/account/email/verify", data).then((r) => r.data),
  forgotPassword: (data: { email: string }) => api.post("/auth/password/forgot", data),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) => api.post("/auth/password/reset", data),
};
