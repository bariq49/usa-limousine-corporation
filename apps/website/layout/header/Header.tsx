"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  COMPANY_PHONE,
  COMPANY_PHONE_HREF,
} from "@/constants/app-default";
import { Phone } from "@usa-limousine-corporation/ui/svg";
import { useHeaderMenu } from "./use-header-menu";
import { HeaderDesktopNav } from "./header-desktop-nav";
import { HeaderMobileMenu } from "./header-mobile-menu";
import { Logo } from "./logo";

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

  const isBookRidePage = pathname?.startsWith("/book-ride");
  const hasSolidBackground = isBookRidePage || isScrolled || mobileOpen;
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
          <div className="relative z-10 shrink-0">
            <Logo variant={useDarkContent ? "dark" : "white"} />
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
            <div className="hidden items-center gap-4 md:flex lg:gap-5">
              <a
                href={COMPANY_PHONE_HREF}
                className={cn(
                  "group flex items-center gap-2 text-sm font-semibold transition-colors hover:text-secondary lg:text-base",
                  useDarkContent ? "text-black" : "text-white"
                )}
              >
                <Phone className="h-5 w-5 shrink-0 text-secondary" />
                <span>{COMPANY_PHONE}</span>
              </a>
            </div>

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
