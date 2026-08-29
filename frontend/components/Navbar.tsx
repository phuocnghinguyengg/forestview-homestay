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
    <header className="sticky top-0 z-50 border-b border-line bg-base/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link href="/" className="font-display text-2xl italic text-primary">
          Homestay <span className="not-italic text-ink">Vinh</span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-ink">
          <Link href="/rooms" className="transition hover:text-primary">
            Danh sách phòng
          </Link>

          {!isAuthenticated && (
            <>
              <Link href="/login" className="transition hover:text-primary">
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-primary px-5 py-2.5 text-white transition hover:bg-primary-dark"
              >
                Đăng ký
              </Link>
            </>
          )}

          {isAuthenticated && user && (
            <>
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="transition hover:text-primary"
              >
                {user.role === "ADMIN" ? "Trang quản trị" : "Tài khoản của tôi"}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full border border-line px-5 py-2.5 transition hover:border-primary hover:text-primary"
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