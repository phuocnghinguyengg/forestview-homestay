"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useAuthModalStore } from "@/hooks/useAuthModalStore";
import AccountPopover from "@/components/AccountPopover";
import NotificationCenter from "@/components/NotificationCenter";

const NAV_SECTIONS = [
  { id: "section-rooms", label: "Hạng phòng" },
  { id: "section-experiences", label: "Trải nghiệm" },
  { id: "section-gallery", label: "Thư viện ảnh" },
  { id: "section-perks", label: "Hội viên" },
  { id: "section-reviews", label: "Đánh giá" },
  { id: "section-location", label: "Vị trí" },
  { id: "section-faq", label: "FAQ" },
  { id: "section-contact", label: "Liên hệ" },
];

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const openAuthModal = useAuthModalStore((s) => s.openModal);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin")) return null;

  const scrollToSection = (id: string) => {
    setOpen(false);
    if (pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    router.push(`/#${id}`);
  };

  const authLinks = !isAuthenticated
    ? [
        { view: "login" as const, label: "Đăng nhập" },
        { view: "register" as const, label: "Đăng ký", primary: true },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="group flex items-center gap-2.5"
          >
            <span className="font-display text-xl leading-none text-ink sm:text-[1.35rem]">
              <span className="italic text-primary">ForestView</span> Homestay
            </span>
          </Link>

          {/* Desktop Section Anchors */}
          <div className="hidden xl:flex items-center gap-1 text-[13px] font-medium text-neutral-600">
            {NAV_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className="rounded-full px-3 py-1.5 transition hover:bg-neutral-200/50 hover:text-primary cursor-pointer"
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Auth / Account */}
        <div className="hidden items-center gap-2.5 text-sm font-medium text-ink md:flex">
          {/* Quick jump to rooms on tablet/smaller screens */}
          <button
            type="button"
            onClick={() => scrollToSection("section-rooms")}
            className="rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10 cursor-pointer xl:hidden"
          >
            Xem phòng
          </button>

          {authLinks.map((l) => (
            <button
              key={l.view}
              type="button"
              onClick={() => { setOpen(false); openAuthModal(l.view); }}
              className={l.primary ? "btn btn-primary text-xs py-2 px-4 shadow-xs" : "rounded-full px-3 py-1.5 text-xs font-semibold transition hover:text-primary cursor-pointer"}
            >
              {l.label}
            </button>
          ))}

          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <NotificationCenter />
              <AccountPopover />
            </div>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          {isAuthenticated && (
            <>
              <NotificationCenter />
              <AccountPopover compact />
            </>
          )}

          <button
            type="button"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2 text-ink transition hover:bg-primary/10"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer panel */}
      {open && (
        <div className="border-t border-line bg-canvas px-5 pt-3 pb-6 text-sm font-medium text-ink md:hidden shadow-lg animate-in slide-in-from-top-2">
          {/* Section Navigation Links */}
          <div className="mb-4 grid grid-cols-2 gap-2 border-b border-line/70 pb-4">
            {NAV_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollToSection(sec.id)}
                className="rounded-xl bg-surface/80 p-2.5 text-left text-xs font-semibold text-neutral-700 hover:bg-primary/10 hover:text-primary transition"
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Auth options if not logged in */}
          {!isAuthenticated && (
            <div className="flex flex-col gap-2">
              {authLinks.map((l) => (
                <button
                  key={l.view}
                  type="button"
                  onClick={() => { setOpen(false); openAuthModal(l.view); }}
                  className={
                    l.primary
                      ? "btn btn-primary w-full py-2.5 text-sm"
                      : "w-full rounded-xl border border-line bg-surface py-2.5 text-center text-sm font-semibold transition hover:bg-neutral-100"
                  }
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
