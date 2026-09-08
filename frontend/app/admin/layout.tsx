"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
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
    <header className="mb-6 border-b border-line pb-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
            <ShieldCheck size={22} />
          </div>
          <div>
            <p className="font-display text-xl text-ink">ForestView studio</p>
            <p className="text-xs text-neutral-500">Không gian vận hành · {user?.fullName || "Quản trị viên"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/" className="rounded-full border border-line px-4 py-2 text-xs font-semibold text-neutral-600 transition hover:border-primary hover:text-primary">
            Xem website
          </Link>
          <NotificationCenter />
          <AccountPopover compact />
        </div>
      </div>

      <nav className="mt-5 flex gap-1.5 overflow-x-auto pb-1" aria-label="Điều hướng quản trị">
        {ADMIN_LINKS.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              type="button"
              onClick={() => setWorkspaceOpen(true)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-3.5 sm:text-sm ${
                active ? "bg-ink text-white shadow-sm" : "text-neutral-500 hover:bg-primary/10 hover:text-primary"
              }`}
            >
              <Icon size={15} />
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
