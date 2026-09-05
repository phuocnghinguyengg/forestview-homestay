"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, UserCog } from "lucide-react";
import { useAuthStore } from "@/hooks/useAuthStore";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Lịch sử đặt hàng", icon: ClipboardList },
  { href: "/account", label: "Tài khoản của tôi", icon: UserCog },
];

function AccountNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const initial = user?.fullName ? user.fullName.trim().charAt(0).toUpperCase() : "?";

  return (
    <aside className="w-full shrink-0 rounded-3xl bg-ink p-3 text-white sm:p-4 md:sticky md:top-5 md:h-fit md:w-64">
      <div className="mb-1 flex items-center gap-3 px-3 pt-2 md:mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 font-display text-base font-bold">
          {initial}
        </div>
        <div className="min-w-0">
          <p className="truncate font-display text-base">{user?.fullName || "Khách"}</p>
          <p className="truncate text-xs text-white/50">{user?.email}</p>
        </div>
      </div>

      <nav className="mt-2 flex gap-1.5 overflow-x-auto pb-1 md:mt-0 md:block md:space-y-1 md:overflow-visible md:pb-0">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium whitespace-nowrap transition md:w-full md:gap-3 md:text-sm ${
                active ? "bg-white text-ink shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={17} strokeWidth={active ? 2.4 : 1.8} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 md:flex-row md:py-8">
      <AccountNav />
      <div className="min-w-0 flex-1 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-7">{children}</div>
    </div>
  );
}
