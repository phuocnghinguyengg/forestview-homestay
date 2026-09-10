"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useAuthModalStore } from "@/hooks/useAuthModalStore";

export default function UnverifiedBanner() {
  const { user, isAuthenticated } = useAuthStore();
  const openModal = useAuthModalStore((s) => s.openModal);
  const pathname = usePathname();

  if (!isAuthenticated || !user || user.emailVerified) return null;
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className="bg-accent/10 px-5 py-2.5 text-center text-sm text-accent">
      Tài khoản của bạn <b>chưa xác thực email</b> — bạn không thể đặt phòng cho đến khi xác thực.{" "}
      <button
        type="button"
        onClick={() => openModal("otp", user.email)}
        className="font-medium underline underline-offset-2"
      >
        Xác thực ngay
      </button>
    </div>
  );
}