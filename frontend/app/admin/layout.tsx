"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BedDouble, CalendarDays, ClipboardList, LayoutDashboard, Star, Tag, Users } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Phòng & hạng phòng", icon: BedDouble },
  { href: "/admin/bookings", label: "Đơn đặt phòng", icon: ClipboardList },
  { href: "/admin/users", label: "Khách hàng", icon: Users },
  { href: "/admin/reviews", label: "Đánh giá", icon: Star },
  { href: "/admin/holidays", label: "Ngày lễ & giá", icon: CalendarDays },
  { href: "/admin/discount-codes", label: "Ưu đãi", icon: Tag },
];

function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-full shrink-0 rounded-3xl bg-ink p-4 text-white md:sticky md:top-5 md:h-fit md:w-64">
      <div className="mb-6 px-3 pt-2"><p className="font-display text-xl">ForestView</p><p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">Admin workspace</p></div>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active ? "bg-white text-ink shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />{item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 md:flex-row md:py-8">
        <AdminNav />
        <div className="min-w-0 flex-1 rounded-3xl border border-line bg-surface p-5 shadow-sm sm:p-7">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
