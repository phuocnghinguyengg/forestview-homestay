import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearAuth } from "./auth";

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Separate, interceptor-free client for the refresh call itself so it never
// recurses into the 401 handler below.
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

// Access tokens expire after 1h; instead of forcing a full re-login every
// time, we transparently exchange the refresh token for a new pair once and
// retry the original request. Concurrent 401s share a single refresh call.
let refreshPromise: Promise<string | null> | null = null;

function redirectToLogin() {
  clearAuth();
  if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- axios interceptor runs outside React tree, next/navigation router is unavailable here
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

    // Never try to refresh when the failing call is itself an auth
    // endpoint (bad login/OTP, or the refresh call failing outright).
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
