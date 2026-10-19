"use client";

import Link from "next/link";
import { cn } from "../../utils/cn";
import { useSidebar } from "../../store/sidebar";
import { useMediaQuery } from "../../hooks/use-media-query";
import { SiteLogo } from "../../svg";

function MenuBar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      className="relative flex h-8 w-8 items-center justify-center overflow-hidden"
      onClick={() => setCollapsed(!collapsed)}
    >
      <div className="flex w-5 flex-col justify-between gap-1">
        <span
          className={cn("block h-0.5 w-5 rounded-full bg-card-foreground transition-all", {
            "translate-y-[5px] rotate-45": collapsed,
          })}
        />
        <span
          className={cn("block h-0.5 w-5 rounded-full bg-card-foreground transition-all", {
            "opacity-0": collapsed,
          })}
        />
        <span
          className={cn("block h-0.5 w-5 rounded-full bg-card-foreground transition-all", {
            "-translate-y-[5px] -rotate-45": collapsed,
          })}
        />
      </div>
    </button>
  );
}

export function VerticalHeader() {
  const { collapsed, setCollapsed, subMenu } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  const showLogo = !isDesktop && isTablet;
  const showMenuBar = !(subMenu && isDesktop);

  return (
    <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
      {showLogo ? (
        <Link href="/dashboard" className="shrink-0 text-primary">
          <SiteLogo className="h-7 w-7" />
        </Link>
      ) : null}
      {showMenuBar ? <MenuBar collapsed={collapsed} setCollapsed={setCollapsed} /> : null}
    </div>
  );
}
