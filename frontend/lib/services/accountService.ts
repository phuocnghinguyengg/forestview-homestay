import api from "@/lib/api";

export interface AccountProfile {
  fullName: string;
  email: string;
  phone: string | null;
}

export const accountService = {
  getProfile: () => api.get<AccountProfile>("/users/me").then((res) => res.data),
  updateProfile: (data: { fullName: string; phone?: string }) =>
    api.put<AccountProfile>("/users/me", data).then((res) => res.data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/users/me/password", data).then((res) => res.data),
  requestEmailChange: (data: { newEmail: string }) =>
    api.post("/users/me/email/request", data).then((res) => res.data),
  verifyEmailChange: (data: { newEmail: string; otp: string }) =>
    api.post<AccountProfile>("/users/me/email/verify", data).then((res) => res.data),
};
