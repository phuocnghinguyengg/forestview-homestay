"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModalStore } from "@/hooks/useAuthModalStore";

export default function LoginPage() {
  const router = useRouter();
  const openModal = useAuthModalStore((s) => s.openModal);

  useEffect(() => {
    openModal("login");
    router.replace("/");
  }, [openModal, router]);

  return null;
}
