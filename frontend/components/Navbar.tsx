"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-rose-600">
          Homestay<span className="text-neutral-900">Vinh</span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          <Link href="/rooms" className="text-neutral-700 hover:text-rose-600">
            Danh sách phòng
          </Link>

          {!isAuthenticated && (
            <>
              <Link href="/login" className="text-neutral-700 hover:text-rose-600">
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700"
              >
                Đăng ký
              </Link>
            </>
          )}

          {isAuthenticated && user && (
            <>
              {user.role === "ADMIN" ? (
                <Link href="/admin" className="text-neutral-700 hover:text-rose-600">
                  Trang quản trị
                </Link>
              ) : (
                <Link href="/dashboard" className="text-neutral-700 hover:text-rose-600">
                  Tài khoản của tôi
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="rounded-full border border-neutral-300 px-4 py-2 font-medium text-neutral-700 hover:bg-neutral-100"
              >
                Đăng xuất
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}