"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Home, MapPin, Phone, LogOut } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import AccountPopover from "@/components/AccountPopover";
import NotificationCenter from "@/components/NotificationCenter";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const { isAuthenticated } = useAuthStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const navLinks = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/room-types", label: "Phòng", icon: MapPin },
    { href: "/contact", label: "Liên hệ", icon: Phone },
  ];

  const authLinks = !isAuthenticated
    ? [
        { href: "/login", label: "Đăng nhập" },
        { href: "/register", label: "Đăng ký", primary: true },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center text-surface font-display font-bold text-lg group-hover:shadow-md transition-shadow">
              F
            </div>
            <div className="hidden sm:block">
              <div className="font-display text-lg font-semibold text-primary">ForestView</div>
              <div className="text-xs text-neutral-600 -mt-1">Homestay</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-neutral-600 hover:text-primary"
                }`}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <NotificationCenter />
                <div className="w-px h-6 bg-line" />
                <AccountPopover />
              </>
            ) : (
              <>
                {authLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={link.primary ? "primary" : "ghost"}
                      size="sm"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Panel */}
      {open && (
        <div className="md:hidden border-t border-line bg-canvas px-4 py-4 animate-slideDown">
          <div className="space-y-3">
            {/* Mobile Navigation */}
            <div className="space-y-2 pb-4 border-b border-line">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === link.href
                      ? "bg-primary-light text-primary font-medium"
                      : "text-ink hover:bg-neutral-100"
                  }`}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth */}
            <div className="space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-3 bg-primary-light rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-surface text-sm font-semibold">
                      U
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink">Tài khoản</p>
                    </div>
                  </div>
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error hover:bg-error-light rounded-lg transition-colors">
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </>
              ) : (
                authLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block"
                  >
                    <Button
                      variant={link.primary ? "primary" : "outline"}
                      fullWidth
                      size="sm"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
