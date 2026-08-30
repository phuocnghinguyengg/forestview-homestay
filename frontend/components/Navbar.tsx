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
        <Link
          href="/"
          className="font-display text-2xl italic text-primary"
        >
          ForestView{" "}
          <span className="not-italic text-ink">
            Homestay
          </span>
        </Link>

        <div className="flex items-center gap-6 text-sm font-medium text-ink">
          <Link
            href="/room-types"
            className="transition hover:text-primary"
          >
            Chọn phòng
          </Link>

          <Link
            href="/about"
            className="transition hover:text-primary"
          >
            Giới thiệu
          </Link>

          <Link
            href="/contact"
            className="transition hover:text-primary"
          >
            Liên hệ
          </Link>

          {!isAuthenticated && (
            <>
              <Link
                href="/login"
                className="transition hover:text-primary"
              >
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
              {user.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="transition hover:text-primary"
                >
                  Trang quản trị
                </Link>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="transition hover:text-primary"
                  >
                    Lịch sử đặt hàng
                  </Link>

                  <Link
                    href="/account"
                    className="transition hover:text-primary"
                  >
                    Tài khoản của tôi
                  </Link>
                </>
              )}

              <button
                type="button"
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