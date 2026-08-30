"use client";

import Link from "next/link";
import { useAuthStore } from "@/hooks/useAuthStore";

export default function UnverifiedBanner() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user || user.emailVerified) return null;

  return (
    <div className="bg-accent/10 px-5 py-2.5 text-center text-sm text-accent">
      Tài khoản của bạn <b>chưa xác thực email</b> — bạn không thể đặt phòng cho đến khi xác thực.{" "}
      <Link
        href={`/verify-otp?email=${encodeURIComponent(user.email)}`}
        className="font-medium underline underline-offset-2"
      >
        Xác thực ngay
      </Link>
    </div>
  );
}