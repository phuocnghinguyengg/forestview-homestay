import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from "./auth";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

function isAuthUrl(url: string) {
  return url.startsWith("/auth/") || url === "/auth";
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  const url = config.url || "";
  const isAuthRequest = isAuthUrl(url);
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

let refreshPromise: Promise<string | null> | null = null;

function redirectToLogin() {
  clearAuth();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    window.location.href = "/login";
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh", { refreshToken })
      .then((res) => {
        const { accessToken, refreshToken: newRefreshToken } = res.data;
        saveTokens(accessToken, newRefreshToken);
        return accessToken as string;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    if (status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";

    if (isAuthUrl(url) || originalRequest._retry) {
      if (url.includes("/auth/refresh")) {
        redirectToLogin();
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return api(originalRequest);
  }
);

export default api;
