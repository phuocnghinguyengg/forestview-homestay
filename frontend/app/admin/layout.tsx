"use client";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="admin-shell mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 md:py-10">
        <div className="admin-surface">{children}</div>
      </div>
    </ProtectedRoute>
  );
}
