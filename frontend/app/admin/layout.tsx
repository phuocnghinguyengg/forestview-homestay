"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuthStore } from "@/hooks/useAuthStore";
import AccountPopover from "@/components/AccountPopover";
import NotificationCenter from "@/components/NotificationCenter";
import AdminWorkspaceModal, { ADMIN_LINKS } from "@/components/AdminWorkspaceModal";


function AdminControlBar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  return (
    <header className="dusk-header -mx-4 -mt-4 mb-6 rounded-none px-4 pt-5 pb-4 sm:-mx-6 sm:-mt-6 sm:px-6 sm:pt-6">
      <div className="hairline-strip absolute inset-x-0 top-0 rounded-none" />
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-xl text-white">ForestView studio</p>
          <p className="text-xs text-white/55">Không gian vận hành · {user?.fullName || "Quản trị viên"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-none border border-white/20 px-4 py-2 text-xs font-semibold text-white/80 transition hover:border-white/40 hover:text-white">
            Xem website
          </Link>
          <NotificationCenter />
          <AccountPopover compact />
        </div>
      </div>

      <nav className="mt-5 flex gap-1.5 overflow-x-auto pb-1" aria-label="Điều hướng quản trị">
        {ADMIN_LINKS.map((item) => {
          const active = pathname === item.href;
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => setWorkspaceOpen(true)}
              className={`inline-flex shrink-0 items-center rounded-none px-3 py-2 text-xs font-semibold transition sm:px-3.5 sm:text-sm ${
                active ? "bg-white/15 text-white shadow-sm" : "text-white/55 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <AdminWorkspaceModal open={workspaceOpen} initialPath={pathname.startsWith("/admin") ? pathname : "/admin"} onClose={() => setWorkspaceOpen(false)} />
    </header>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="admin-shell mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-10">
        <div className={searchParams.get("embedded") === "1" ? "min-h-full" : "admin-surface"}>
          {searchParams.get("embedded") !== "1" && <AdminControlBar />}
          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  );
}
