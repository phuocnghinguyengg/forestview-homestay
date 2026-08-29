import { create } from "zustand";
import { AuthUser } from "@/types";
import { getStoredUser, saveAuth, clearAuth } from "@/lib/auth";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (accessToken, refreshToken, user) => {
    saveAuth(accessToken, refreshToken, user);
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    clearAuth();
    set({ user: null, isAuthenticated: false });
  },
  hydrate: () => {
    const user = getStoredUser();
    if (user && (user.role === "USER" || user.role === "ADMIN")) {
      set({ user, isAuthenticated: true });
    } else if (user) {
      clearAuth();
      set({ user: null, isAuthenticated: false });
    }
  },
}));