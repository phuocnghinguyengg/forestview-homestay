import { create } from "zustand";

export type AuthModalView = "login" | "register" | "otp" | "forgot";

interface AuthModalState {
  open: boolean;
  view: AuthModalView;
  email: string;
  token: number;
  openModal: (view: AuthModalView, email?: string) => void;
  setView: (view: AuthModalView, email?: string) => void;
  close: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  open: false,
  view: "login",
  email: "",
  token: 0,
  openModal: (view, email = "") => set((state) => ({ open: true, view, email, token: state.token + 1 })),
  setView: (view, email) => set((state) => ({ view, email: email ?? state.email, token: state.token + 1 })),
  close: () => set({ open: false }),
}));
