"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.push("/");
  };

  const links = !isAuthenticated
    ? [
        { href: "/login", label: "Đăng nhập" },
        { href: "/register", label: "Đăng ký", primary: true },
      ]
    : user?.role === "ADMIN"
      ? [{ href: "/admin", label: "Trang quản trị" }]
      : [
          { href: "/dashboard", label: "Lịch sử đặt hàng" },
          { href: "/account", label: "Tài khoản của tôi" },
        ];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-base/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="font-display text-xl italic text-primary sm:text-2xl"
        >
          ForestView{" "}
          <span className="not-italic text-ink">Homestay</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 text-sm font-medium text-ink md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={
                l.primary
                  ? "rounded-full bg-primary px-5 py-2.5 text-white transition hover:bg-primary-dark"
                  : "transition hover:text-primary"
              }
            >
              {l.label}
            </Link>
          ))}

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-line px-5 py-2.5 transition hover:border-primary hover:text-primary"
            >
              Đăng xuất
            </button>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          onClick={() => setOpen((v) => !v)}
          className="rounded-full p-2 text-ink transition hover:bg-primary/10 md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-line bg-base px-5 pt-2 pb-5 text-sm font-medium text-ink md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={
                  l.primary
                    ? "mt-1 rounded-xl bg-primary px-4 py-3 text-center text-white transition hover:bg-primary-dark"
                    : "rounded-xl px-4 py-3 transition hover:bg-primary/10 hover:text-primary"
                }
              >
                {l.label}
              </Link>
            ))}

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="mt-1 rounded-xl border border-line px-4 py-3 text-left transition hover:border-primary hover:text-primary"
              >
                Đăng xuất
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
