"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuthModalStore } from "@/hooks/useAuthModalStore";

function ForgotPasswordRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openModal = useAuthModalStore((s) => s.openModal);

  useEffect(() => {
    openModal("forgot", searchParams.get("email") ?? "");
    router.replace("/");
  }, [openModal, router, searchParams]);

  return null;
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordRedirect />
    </Suspense>
  );
}
