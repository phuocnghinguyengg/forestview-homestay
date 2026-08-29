import api from "@/lib/api";
import { AuthResponse } from "@/types";

export const authService = {
  register: (data: { fullName: string; email: string; password: string; phone?: string }) =>
    api.post<AuthResponse>("/auth/register", data).then((res) => res.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>("/auth/login", data).then((res) => res.data),
};