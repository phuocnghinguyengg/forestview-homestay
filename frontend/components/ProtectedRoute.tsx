"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useAuthModalStore } from "@/hooks/useAuthModalStore";
import { Role } from "@/types";

export default function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: Role[];
}) {
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrate = useAuthStore((state) => state.hydrate);
  const openAuthModal = useAuthModalStore((s) => s.openModal);

  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      await hydrate();

      if (!cancelled) {
        setChecked(true);
      }
    };

    void checkAuth();

    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  useEffect(() => {
    if (!checked) return;

    if (!isAuthenticated) {
      // App không có trang /login riêng — chỉ có modal đăng nhập ở landing
      // page. Điều hướng về "/" và mở sẵn modal thay vì trỏ tới route không
      // tồn tại (trước đây là "/login" -> 404).
      router.replace("/");
      openAuthModal("login");
      return;
    }

    if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
      router.replace("/");
    }
  }, [checked, isAuthenticated, user, allowedRoles, router, openAuthModal]);

  if (!checked) {
    return (
      <div className="p-10 text-center text-neutral-500">
        Đang kiểm tra đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="p-10 text-center text-neutral-500">
        Đang chuyển về trang chủ để đăng nhập...
      </div>
    );
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="p-10 text-center text-neutral-500">
        Bạn không có quyền truy cập trang này...
      </div>
    );
  }

  return <>{children}</>;
}