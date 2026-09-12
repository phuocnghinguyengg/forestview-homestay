"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useAuthModalStore } from "@/hooks/useAuthModalStore";
import AccountPopover from "@/components/AccountPopover";
import NotificationCenter from "@/components/NotificationCenter";

const NAV_LINKS = [
  { id: "top", label: "HOME" },
  { id: "section-rooms", label: "ROOMS" },
  { id: "section-perks", label: "REVIEWS" },
  { id: "section-faq", label: "FAQS" },
];

export default function Navbar() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const openAuthModal = useAuthModalStore((s) => s.openModal);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);

  const isHome = pathname === "/";

  // On the homepage, the header floats transparent over the hero until the
  // user scrolls past it; everywhere else it's always solid.
  useEffect(() => {
    if (!isHome) return;
    const handler = () => setScrolledPastHero(window.scrollY > 64);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [isHome]);

  if (pathname.startsWith("/admin")) return null;

  const transparent = isHome && !scrolledPastHero;

  const scrollToSection = (id: string) => {
    setOpen(false);
    if (id === "top") {
      if (pathname === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        router.push("/");
      }
      return;
    }
    if (pathname === "/") {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    router.push(`/#${id}`);
  };

  const handleMembershipClick = () => {
    setOpen(false);
    openAuthModal("login");
  };

  return (
    <>
      <header
        className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
          transparent ? "bg-transparent" : "border-b border-line bg-canvas/95 shadow-sm backdrop-blur-md"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:py-5">
          <button
            type="button"
            onClick={() => scrollToSection("top")}
            className="group flex items-center gap-2.5 cursor-pointer"
          >
            <span
              className={`font-display text-xl leading-none sm:text-[1.4rem] ${
                transparent ? "text-white" : "text-ink"
              }`}
            >
              <span className="italic text-accent">ForestView</span> Homestay
            </span>
          </button>

          {/* Desktop nav */}
          <div
            className={`hidden items-center gap-x-8 font-label text-[15px] uppercase tracking-[3px] md:flex ${
              transparent ? "text-white" : "text-ink"
            }`}
          >
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => scrollToSection(link.id)}
                className="transition hover:text-accent cursor-pointer"
              >
                {link.label}
              </button>
            ))}

            {!isAuthenticated ? (
              <button
                type="button"
                onClick={handleMembershipClick}
                className="transition hover:text-accent cursor-pointer"
              >
                MEMBER
              </button>
            ) : (
              <div className="flex items-center gap-2.5 normal-case tracking-normal">
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
              className={`rounded-full p-2 transition hover:bg-primary/10 ${transparent ? "text-white" : "text-ink"}`}
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>

        {/* Mobile drawer panel */}
        {open && (
          <div className="border-t border-line bg-canvas px-5 pt-3 pb-6 text-sm font-medium text-ink md:hidden shadow-lg animate-in slide-in-from-top-2">
            <div className="flex flex-col gap-1 font-label text-base uppercase tracking-[2px]">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => scrollToSection(link.id)}
                  className="rounded-none px-2.5 py-2.5 text-left hover:bg-primary/10 hover:text-primary transition"
                >
                  {link.label}
                </button>
              ))}
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={handleMembershipClick}
                  className="rounded-none px-2.5 py-2.5 text-left hover:bg-primary/10 hover:text-primary transition"
                >
                  MEMBER
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer: the header is fixed, so non-home pages (and the home page once
          the hero has been scrolled past) need the layout pushed down by its height.
          The homepage hero is designed to sit full-bleed behind the transparent header. */}
      {!isHome && <div className="h-[68px] sm:h-[76px]" aria-hidden />}
    </>
  );
}
