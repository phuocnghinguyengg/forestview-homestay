import axios from "axios";
import { getAccessToken, clearAuth } from "./auth";

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, ""),
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  const url = config.url || "";
  const isAuthRequest = url.startsWith("/auth/") || url === "/auth";
  const isFormData = typeof FormData !== "undefined" && config.data instanceof FormData;

  if (token && !isAuthRequest) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!isFormData) {
    config.headers["Content-Type"] = "application/json";
  } else {
    delete config.headers["Content-Type"];
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- axios interceptor runs outside React tree, next/navigation router is unavailable here
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
