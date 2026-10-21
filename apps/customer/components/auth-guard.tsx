"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LayoutLoader } from "@usa-limousine-corporation/ui/layout/layout-loader";
import { UserProvider } from "@usa-limousine-corporation/ui/providers/user-context";
import { getMe } from "@/lib/api/auth";
import type { CurrentUser } from "@/lib/api/types";
import { bootstrapAuthSession } from "@/lib/auth/bootstrap";
import { isCustomerUser } from "@/lib/auth/roles";
import { clearAuthSession, hasAccessToken } from "@/lib/auth/session";
import { useAuthLogout } from "@/hooks/queries/use-auth";
import { RealtimeProvider } from "./realtime-provider";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const { mutate: logout, isPending: isLoggingOut } = useAuthLogout();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const hasToken = hasAccessToken() || (await bootstrapAuthSession());
      if (cancelled) {
        return;
      }

      if (!hasToken) {
        const callback = encodeURIComponent(`${pathname}${window.location.search}`);
        router.replace(`/auth/login?callbackUrl=${callback}`);
        return;
      }

      try {
        const user = await getMe();
        if (cancelled) {
          return;
        }

        if (!isCustomerUser(user)) {
          clearAuthSession();
          toast.error("Access denied. This portal is for customer accounts only.");
          router.replace("/auth/login");
          return;
        }

        setCurrentUser(user);
      } catch {
        if (cancelled) {
          return;
        }
        clearAuthSession();
        const callback = encodeURIComponent(`${pathname}${window.location.search}`);
        router.replace(`/auth/login?callbackUrl=${callback}`);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!currentUser) {
    return <LayoutLoader />;
  }

  return (
    <UserProvider
      user={currentUser}
      onLogout={() => logout()}
      isLoggingOut={isLoggingOut}
      onUpdateUser={(updated) => setCurrentUser((prev) => (prev ? { ...prev, ...updated } : null))}
    >
      <RealtimeProvider>{children}</RealtimeProvider>
    </UserProvider>
  );
}
