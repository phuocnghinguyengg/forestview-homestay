"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useAuthModalStore } from "@/hooks/useAuthModalStore";
import AccountPopover from "@/components/AccountPopover";
import NotificationCenter from "@/components/NotificationCenter";

export default function Navbar() {
  const { isAuthenticated } = useAuthStore();
  const openAuthModal = useAuthModalStore((s) => s.openModal);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const links = !isAuthenticated
    ? [
        { view: "login" as const, label: "Đăng nhập" },
        { view: "register" as const, label: "Đăng ký", primary: true },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="group flex items-center gap-2.5"
        >
          <span className="font-display text-xl leading-none text-ink sm:text-[1.35rem]">
            <span className="italic text-primary">ForestView</span> Homestay
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-3 text-sm font-medium text-ink md:flex">
          {links.map((l) => (
            <button
              key={l.view}
              type="button"
              onClick={() => { setOpen(false); openAuthModal(l.view); }}
              className={l.primary ? "btn btn-primary" : "rounded-full px-3 py-2 transition hover:text-primary"}
            >
              {l.label}
            </button>
          ))}

          {isAuthenticated && <><NotificationCenter /><AccountPopover /></>}
        </div>

        {/* Mobile controls */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 md:hidden">
            <NotificationCenter />
            <AccountPopover compact />
          </div>
        ) : (
          <button
            type="button"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-ink transition hover:bg-primary/10 md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        )}
      </nav>

      {/* Mobile panel */}
      {open && !isAuthenticated && (
        <div className="border-t border-line bg-canvas px-5 pt-2 pb-5 text-sm font-medium text-ink md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <button
                key={l.view}
                type="button"
                onClick={() => { setOpen(false); openAuthModal(l.view); }}
                className={
                  l.primary
                    ? "btn btn-primary mt-1 w-full"
                    : "w-full rounded-xl px-4 py-3 text-left transition hover:bg-primary/10 hover:text-primary"
                }
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
