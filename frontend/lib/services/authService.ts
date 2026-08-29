import api from "@/lib/api";
import { AuthResponse, RegisterResponse } from "@/types";

export const authService = {
  register: (data: { fullName: string; email: string; password: string; phone?: string }) =>
    api.post<RegisterResponse>("/auth/register", data).then((res) => res.data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post<AuthResponse>("/auth/verify-otp", data).then((res) => res.data),

  resendOtp: (data: { email: string }) => api.post("/auth/resend-otp", data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data).then((res) => res.data),

  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgot-password", data).then((res) => res.data),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post("/auth/reset-password", data).then((res) => res.data),
};