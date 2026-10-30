"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { CircleUser } from "@usa-limousine-corporation/ui/svg";
import { Logo } from "@usa-limousine-corporation/ui/components/logo";
import { getCustomerAppUrl } from "@/lib/api/base-url";
import { useHeaderMenu } from "./use-header-menu";
import { HeaderDesktopNav } from "./header-desktop-nav";
import { HeaderMobileMenu } from "./header-mobile-menu";

const SCROLL_THRESHOLD = 10;

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const {
    mobileOpen,
    openDropdownId,
    closeAll,
    openDropdown,
    scheduleCloseDropdown,
    toggleMobile,
    toggleDropdown,
    mobileMenuRef,
    mobileToggleRef,
    desktopNavRef,
  } = useHeaderMenu(pathname);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isSolidRoute =
    Boolean(pathname?.startsWith("/book-ride")) || Boolean(pathname?.startsWith("/blog"));
  const hasSolidBackground = isSolidRoute || isScrolled || mobileOpen;
  const useDarkContent = hasSolidBackground;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-70 w-full transition-colors duration-300",
        hasSolidBackground ? "bg-white shadow-md" : "bg-transparent shadow-none"
      )}
      role="banner"
    >
      <div className="relative mx-auto container px-4">
        <div className="relative flex h-16 items-center justify-between md:h-20">
          <div className="relative z-10 flex shrink-0 items-center pt-1">
            <Logo
              href="/"
              size="lg"
              tone={useDarkContent ? "dark" : "white"}
              className="h-8 w-46 sm:h-10 sm:w-62 md:h-11 md:w-68"
            />
          </div>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <HeaderDesktopNav
              ref={desktopNavRef}
              pathname={pathname}
              openDropdownId={openDropdownId}
              onDropdownOpen={openDropdown}
              onDropdownClose={scheduleCloseDropdown}
              inverted={useDarkContent}
            />
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <a
              href={`${getCustomerAppUrl()}/auth/login`}
              className={cn(
                "hidden items-center gap-2 rounded-lg border px-4 py-2 text-base font-semibold transition-colors md:inline-flex",
                useDarkContent
                  ? "border-border text-black hover:bg-gray-50"
                  : "border-white/40 text-white hover:bg-white/10"
              )}
            >
              <CircleUser className="h-4.5 w-4.5" />
              Sign-in
            </a>

            <HeaderMobileMenu
              ref={mobileMenuRef}
              isOpen={mobileOpen}
              pathname={pathname}
              openDropdownId={openDropdownId}
              onClose={closeAll}
              onToggleDropdown={toggleDropdown}
              toggleMobile={toggleMobile}
              mobileToggleRef={mobileToggleRef}
              inverted={useDarkContent}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
