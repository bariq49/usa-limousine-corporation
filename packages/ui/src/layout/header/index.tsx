"use client";

import { cn } from "../../utils/cn";
import { useSidebar } from "../../store/sidebar";
import { useMediaQuery } from "../../hooks/use-media-query";
import { ProfileInfo } from "./profile-info";
import { VerticalHeader } from "./vertical-header";
import { FullScreenToggle } from "./full-screen";
import { NotificationBell } from "./notification-bell";

export function Header() {
  const { collapsed } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  return (
    <header
      className={cn("sticky top-0 z-50 w-full max-w-full transition-all duration-150", {
        "xl:ml-[300px] xl:w-[calc(100%-300px)]": !collapsed,
        "xl:ml-[72px] xl:w-[calc(100%-72px)]": collapsed,
      })}
    >
      <div className="w-full max-w-full overflow-hidden border-b border-border bg-card/90 px-4 py-2.5 backdrop-blur-lg sm:px-6 md:py-3">
        <div className="flex min-w-0 items-center justify-between gap-1 sm:gap-2">
          <VerticalHeader />
          <div className="nav-tools flex max-w-[calc(100%-2.5rem)] shrink items-center justify-end gap-0.5 sm:gap-1.5">
            {isDesktop ? <FullScreenToggle /> : null}
            <NotificationBell />
            <ProfileInfo />
          </div>
        </div>
      </div>
    </header>
  );
}
