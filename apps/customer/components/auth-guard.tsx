"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { bootstrapAuthSession } from "@/lib/auth/bootstrap";
import { hasAccessToken } from "@/lib/auth/session";

async function ensureAuthSession(): Promise<boolean> {
  return hasAccessToken() || (await bootstrapAuthSession());
}

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const ok = await ensureAuthSession();
      if (cancelled) {
        return;
      }

      if (!ok) {
        const callback = encodeURIComponent(`${pathname}${window.location.search}`);
        router.replace(`/auth/login?callbackUrl=${callback}`);
        return;
      }

      setAllowed(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!allowed) {
    return null;
  }

  return children;
}
