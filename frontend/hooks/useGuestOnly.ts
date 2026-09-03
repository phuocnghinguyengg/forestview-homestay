import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";

/**
 * Redirects an already-authenticated user away from guest-only pages
 * (login, register, forgot-password) so they can't land back on them
 * after signing in. Admins go to /admin, regular users go home.
 */
export function useGuestOnly() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(user?.role === "ADMIN" ? "/admin" : "/");
    }
  }, [isAuthenticated, user, router]);
}
