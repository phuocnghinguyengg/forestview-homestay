import api from "@/lib/api";
import { AuthUser } from "@/types";

export interface AccountProfile extends AuthUser {
  id?: number;
  phone: string | null;
}

export interface ProfileUpdateRequest {
  fullName: string;
  phone: string;
}

export const accountService = {
  getMe: () => api.get<AccountProfile>("/users/me").then((res) => res.data),

  updateProfile: (data: ProfileUpdateRequest) =>
    api.put<AccountProfile>("/users/me", data).then((res) => res.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/users/me/password", data).then((res) => res.data),

  requestEmailChange: (data: { newEmail: string }) =>
    api.post("/users/me/email/request", data).then((res) => res.data),

  verifyEmailChange: (data: { newEmail: string; otp: string }) =>
    api.post<AccountProfile>("/users/me/email/verify", data).then((res) => res.data),
};
