"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { PLATFORM } from "@usa-limousine-corporation/config";
import {
  ArrowRight,
  ChevronDown,
  CircleUser,
  Close,
  Menu,
  Phone,
  WhatsApp,
} from "@usa-limousine-corporation/ui/svg";
import { Logo } from "@usa-limousine-corporation/ui/components/logo";
import { getCustomerAppUrl } from "@/lib/api/base-url";
import { NAV_LINKS, isNavActive } from "@/constants/navigation";


interface HeaderMobileMenuProps {
  isOpen: boolean;
  pathname: string | null;
  openDropdownId: string | null;
  onClose: () => void;
  onToggleDropdown: (id: string) => void;
  toggleMobile: () => void;
  mobileToggleRef: React.RefObject<HTMLButtonElement | null>;
  /** Dark icon for white header background */
  inverted?: boolean;
}

export const HeaderMobileMenu = forwardRef<HTMLDivElement, HeaderMobileMenuProps>(
  (
    {
      isOpen,
      pathname,
      openDropdownId,
      onClose,
      onToggleDropdown,
      toggleMobile,
      mobileToggleRef,
      inverted = false,
    },
    ref
  ) => {
    return (
      <>
        <div className="flex items-center gap-2 md:hidden">
          <a
            href={`${getCustomerAppUrl()}/auth/login`}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
              inverted
                ? "border-border text-black hover:bg-gray-50"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            <CircleUser className="h-4 w-4" />
            Sign-in
          </a>

          <button
            ref={mobileToggleRef}
            type="button"
            className={`inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
              inverted
                ? "border-border text-black hover:bg-gray-50"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
            onClick={toggleMobile}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <span className="relative inline-flex h-5.5 w-5.5 items-center justify-center">
              <Menu
                className={`absolute inset-0 m-auto h-5.5 w-5.5 transition-all duration-300 ${
                  isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                }`}
                strokeWidth={2.5}
              />
              <Close
                className={`absolute inset-0 m-auto h-5.5 w-5.5 transition-all duration-300 ${
                  isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
                }`}
                strokeWidth={2.5}
              />
            </span>
          </button>
        </div>

        <div
          ref={ref}
          className={`fixed inset-0 z-60 transition-all duration-300 ease-in-out md:hidden ${isOpen ? "pointer-events-auto visible opacity-100" : "pointer-events-none invisible opacity-0"
            }`}
          role="dialog"
          aria-modal={isOpen}
          aria-label="Mobile navigation menu"
        >
          <div className="flex h-full flex-col overflow-hidden overscroll-none bg-black">
            {/* Mobile Menu Header */}
            <div className="flex h-16 flex-shrink-0 items-center justify-between px-4">
              <div className="flex shrink-0 items-center pt-1">
                <Logo href="/" size="lg" tone="white" className="h-8 w-46 sm:h-10 sm:w-62" />
              </div>
              <button
                type="button"
                onClick={toggleMobile}
                className="inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-white/40 text-white transition-colors hover:bg-white/10"
                aria-label="Close menu"
              >
                <Close className="h-5.5 w-5.5" strokeWidth={2.5} />
              </button>
            </div>

            <nav className="flex-1 divide-y divide-border/40 overflow-y-auto overscroll-contain px-4 pb-10 sm:px-6 mt-4" role="menu">
              {NAV_LINKS.map((link) => {
                const active = isNavActive(pathname, link);

                if (!link.sublinks) {
                  return (
                    <div key={link.title}>
                      <Link
                        href={link.path || "#"}
                        onClick={onClose}
                        role="menuitem"
                        className={`block py-4 text-base font-medium transition-colors ${active ? "text-secondary" : "text-background hover:text-secondary-400"
                          }`}
                      >
                        {link.title}
                      </Link>
                    </div>
                  );
                }

                const isDropdownOpen = openDropdownId === link.title;

                return (
                  <div key={link.title}>
                    <button
                      onClick={() => onToggleDropdown(link.title)}
                      className={`flex w-full items-center justify-between py-4 text-left text-base font-medium transition-colors ${active ? "text-secondary" : "text-background hover:text-secondary-400"
                        }`}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                      role="menuitem"
                    >
                      {link.title}
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? "max-h-vh-50 opacity-100" : "max-h-0 opacity-0"
                        }`}
                      role="menu"
                    >
                      <div className="max-h-vh-50 space-y-1 overflow-y-auto overscroll-contain pb-3 pl-4 scrollbar-thin-light">
                        {link.sublinks.map((sub) => (
                          <Link
                            key={sub.title}
                            href={sub.path}
                            onClick={onClose}
                            role="menuitem"
                            className={`group flex items-center gap-2 py-2 text-sm transition-colors ${pathname === sub.path ? "text-secondary" : "text-background/80 hover:text-secondary-400"
                              }`}
                          >
                            <ArrowRight className="h-3.5 w-3.5 text-background/40 transition-all duration-200 group-hover:translate-x-1 group-hover:text-secondary-400" />
                            <span className="transition-all duration-200 group-hover:translate-x-1">{sub.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

            </nav>

            <div className="grid flex-shrink-0 grid-cols-2 gap-3 px-4 pt-4 pb-8 sm:px-6">
              <a
                href={PLATFORM.contact.whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/40 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <WhatsApp className="h-5 w-5" />
                WhatsApp
              </a>
              <a
                href={PLATFORM.contact.phoneHref}
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/40 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <Phone className="h-5 w-5" />
                Call us
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }
);

HeaderMobileMenu.displayName = "HeaderMobileMenu";
