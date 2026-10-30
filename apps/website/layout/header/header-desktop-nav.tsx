"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "@usa-limousine-corporation/ui/svg";
import { NAV_LINKS, isNavActive } from "@/constants/navigation";

interface HeaderDesktopNavProps {
  pathname: string | null;
  openDropdownId: string | null;
  onDropdownOpen: (id: string) => void;
  onDropdownClose: () => void;
  /** Dark text for white header background */
  inverted?: boolean;
}

export const HeaderDesktopNav = forwardRef<HTMLElement, HeaderDesktopNavProps>(
  (
    {
      pathname,
      openDropdownId,
      onDropdownOpen,
      onDropdownClose,
      inverted = false,
    },
    ref
  ) => {
    const idleLinkClass = inverted
      ? "text-black/80 hover:text-black"
      : "text-white/90 hover:text-white";

    return (
      <nav
        ref={ref}
        className="hidden items-center gap-1 md:flex"
        role="menubar"
      >
        {NAV_LINKS.map((link) => {
          const active = isNavActive(pathname, link);

          if (!link.sublinks) {
            return (
              <Link
                key={link.title}
                href={link.path || "#"}
                role="menuitem"
                className={`cursor-pointer px-2 py-2 text-base font-bold transition-colors ${
                  active ? "text-secondary" : idleLinkClass
                }`}
              >
                {link.title}
              </Link>
            );
          }

          const isOpen = openDropdownId === link.title;

          return (
            <div
              key={link.title}
              className="relative"
              onMouseEnter={() => onDropdownOpen(link.title)}
              onMouseLeave={onDropdownClose}
            >
              <button
                type="button"
                className={`flex cursor-pointer items-center bg-transparent px-2 py-2 text-base font-bold transition-colors ${
                  active || isOpen ? "text-secondary" : idleLinkClass
                }`}
                aria-haspopup="true"
                aria-expanded={isOpen}
                role="menuitem"
              >
                <span>{link.title}</span>
                <ChevronDown
                  className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  className="absolute left-0 top-full origin-top-left animate-in fade-in slide-in-from-top-2 pt-4 duration-200 w-80"
                  onMouseEnter={() => onDropdownOpen(link.title)}
                  onMouseLeave={onDropdownClose}
                >
                  <div
                    className="relative rounded-md border border-border bg-white p-1.5 shadow-2xl"
                    role="menu"
                  >
                    <div className="absolute -top-3 left-8 h-3.5 w-6">
                      <svg
                        viewBox="0 0 20 12"
                        className="h-full w-full fill-white drop-shadow-tab"
                      >
                        <path d="M0 12 C4 12 7 0 10 0 C13 0 16 12 20 12" />
                      </svg>
                    </div>

                    <div className="relative z-10 flex max-h-dropdown flex-col gap-0.5 overflow-y-auto overscroll-contain py-0.5 scrollbar-none">
                      {link.sublinks.map((sub) => {
                        const Icon = sub.icon;
                        return (
                          <Link
                            key={sub.title}
                            href={sub.path}
                            role="menuitem"
                            className={`group flex cursor-pointer items-center gap-2 rounded-md px-3 py-1 text-sm font-bold transition-all duration-300 ${
                              pathname === sub.path
                                ? "bg-secondary/10 text-secondary"
                                : "text-gray-600 hover:bg-gray-50 hover:text-secondary"
                            }`}
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/10 transition-all duration-300 group-hover:bg-secondary/20">
                              {Icon ? (
                                <Icon className="h-4 w-4 text-secondary" />
                              ) : (
                                <ArrowRight className="h-3 w-3 text-gray-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-secondary" />
                              )}
                            </div>
                            <span className="whitespace-nowrap transition-all duration-300 group-hover:translate-x-0.5">
                              {sub.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  }
);

HeaderDesktopNav.displayName = "HeaderDesktopNav";
