import api from "@/lib/api";

export const passwordService = {
  forgot: (email: string) =>
    api.post("/auth/forgot-password", { email }).then((res) => res.data),
  reset: (data: { email: string; otp: string; newPassword: string }) =>
    api.post("/auth/reset-password", data).then((res) => res.data),
};
