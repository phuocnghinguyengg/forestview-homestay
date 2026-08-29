"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

const NAV_ITEMS = [
  { href: "/admin", label: "Tổng quan" },
  { href: "/admin/rooms", label: "Quản lý phòng" },
  { href: "/admin/bookings", label: "Đơn đặt phòng" },
  { href: "/admin/users", label: "Người dùng" },
];

function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-neutral-200 p-4">
      <p className="mb-4 px-2 text-xs font-semibold uppercase text-neutral-400">Quản trị</p>
      <nav className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                active ? "bg-rose-600 text-white" : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {item.label}
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
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
        <AdminNav />
        <div className="flex-1">{children}</div>
      </div>
    </ProtectedRoute>
  );
}