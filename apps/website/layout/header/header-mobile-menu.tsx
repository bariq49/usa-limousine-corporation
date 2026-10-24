"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Close, Menu, Phone, WhatsApp } from "@usa-limousine-corporation/ui/svg";
import { NAV_LINKS, isNavActive } from "@/constants/navigation";
import { COMPANY_PHONE, COMPANY_PHONE_HREF, COMPANY_WHATSAPP_HREF } from "@/constants/app-default";

import { Logo } from "./logo";

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
        <div className="flex items-center gap-3 md:hidden">
          <div className="flex items-center gap-2">
            <a
              href={COMPANY_PHONE_HREF}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white shadow-sm transition-all duration-300 hover:scale-105"
              aria-label={`Call ${COMPANY_PHONE}`}
            >
              <Phone className="h-4 w-4" strokeWidth={2.5} />
            </a>
            <a
              href={COMPANY_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-whatsapp text-white shadow-sm transition-all duration-300 hover:scale-105 hover:bg-whatsapp-dark"
              aria-label="Chat on WhatsApp"
            >
              <WhatsApp className="h-4 w-4" fill="currentColor" />
            </a>
          </div>

          <button
            ref={mobileToggleRef}
            className={`relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-sm transition-all duration-200 ${
              inverted ? "text-black" : "text-white"
            }`}
            onClick={toggleMobile}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <div className="relative h-6 w-6">
              <Menu
                className={`absolute inset-0 transition-all duration-300 ${isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
                strokeWidth={2.5}
              />
              <Close
                className={`absolute inset-0 transition-all duration-300 ${isOpen ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
                strokeWidth={2.5}
              />
            </div>
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
          <div className="flex h-full flex-col overflow-hidden bg-black">
            {/* Mobile Menu Header */}
            <div className="flex h-20 flex-shrink-0 items-center justify-between px-4">
              <Logo variant="white" />
              <button
                onClick={toggleMobile}
                className="p-2 text-white transition-colors hover:text-secondary"
                aria-label="Close menu"
              >
                <Close className="h-7 w-7" strokeWidth={2} />
              </button>
            </div>

            <nav className="flex-1 divide-y divide-border/40 overflow-y-auto px-4 pb-10 sm:px-6 mt-4" role="menu">
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
          </div>
        </div>
      </>
    );
  }
);

HeaderMobileMenu.displayName = "HeaderMobileMenu";
