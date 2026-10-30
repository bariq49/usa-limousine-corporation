"use client";

import Link from "next/link";
import { cn } from "../../utils/cn";
import { useSidebar } from "../../store/sidebar";
import { useMediaQuery } from "../../hooks/use-media-query";
import { Logo } from "../../components/logo";

function MenuBar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      className="relative flex h-10 w-10 items-center justify-center overflow-hidden"
      onClick={onToggle}
    >
      <div className="flex w-6 flex-col justify-between gap-1.5">
        <span
          className={cn("block h-0.5 w-6 rounded-full bg-card-foreground transition-all", {
            "translate-y-2 rotate-45": collapsed,
          })}
        />
        <span
          className={cn("block h-0.5 w-6 rounded-full bg-card-foreground transition-all", {
            "opacity-0": collapsed,
          })}
        />
        <span
          className={cn("block h-0.5 w-6 rounded-full bg-card-foreground transition-all", {
            "-translate-y-2 -rotate-45": collapsed,
          })}
        />
      </div>
    </button>
  );
}

export function VerticalHeader() {
  const { collapsed, setCollapsed, subMenu, setOpenRequested } = useSidebar();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isTablet = useMediaQuery("(min-width: 768px)");
  const showLogo = !isDesktop && isTablet;
  const showMenuBar = !(subMenu && isDesktop);

  return (
    <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
      {showLogo ? (
        <Link href="/dashboard" className="shrink-0 text-primary">
          <Logo />
        </Link>
      ) : null}
      {showMenuBar ? (
        <MenuBar
          collapsed={collapsed}
          onToggle={() => (isDesktop ? setCollapsed(!collapsed) : setOpenRequested(true))}
        />
      ) : null}
    </div>
  );
}
