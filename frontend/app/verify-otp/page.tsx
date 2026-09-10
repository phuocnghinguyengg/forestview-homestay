"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthModalStore } from "@/hooks/useAuthModalStore";

function VerifyOtpRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openModal = useAuthModalStore((s) => s.openModal);

  useEffect(() => {
    openModal("otp", searchParams.get("email") ?? "");
    router.replace("/");
  }, [openModal, router, searchParams]);

  return null;
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={null}>
      <VerifyOtpRedirect />
    </Suspense>
  );
}
