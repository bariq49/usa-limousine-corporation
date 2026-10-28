import type { ComponentType, SVGProps } from "react";
export type NavItem = {
  title: string;
  href: string;
};

export type NavLink = {
  title: string;
  path?: string;
  sublinks?: { title: string; path: string; icon?: ComponentType<SVGProps<SVGSVGElement>> }[];
};

export const QUICK_NAV_ITEMS = [
  { title: "Home", href: "/" },
  { title: "Services", href: "/services" },
  { title: "About Us", href: "/about-us" },
  { title: "Blog", href: "/blog" },
  { title: "Contact", href: "/contact-us" },
] as const satisfies readonly NavItem[];

export const SERVICE_LINKS = [
  { title: "Airport Transfers", href: "/#hero-booking" },
  { title: "Hourly Chauffeur", href: "/#hero-booking" },
  { title: "Corporate Transportation", href: "/#hero-booking" },
  { title: "Point-to-Point Transfers", href: "/#hero-booking" },
  { title: "Concert Transportation", href: "/#hero-booking" },
  { title: "Sporting Event Transportation", href: "/#hero-booking" },
  { title: "Wedding Transportation", href: "/#hero-booking" },
  { title: "Prom Transportation", href: "/#hero-booking" },
  { title: "Diplomatic & Government", href: "/#hero-booking" },
] as const satisfies readonly NavItem[];


export const AIRPORTS = [
  { code: "EWR", name: "Newark" },
  { code: "JFK", name: "John F. Kennedy" },
  { code: "LGA", name: "LaGuardia" },
  { code: "TEB", name: "Teterboro" },
  { code: "HPN", name: "Westchester" },
  { code: "PHL", name: "Philadelphia" },
  { code: "MMU", name: "Morristown" },
  { code: "TTN", name: "Trenton-Mercer" },
  { code: "ACY", name: "Atlantic City" },
  { code: "ISP", name: "MacArthur" },
  { code: "SWF", name: "Stewart" },
] as const;

export const NAV_LINKS: NavLink[] = [
  { title: "Home", path: "/" },
  { title: "Services", path: "/services" },
  { title: "About Us", path: "/about-us" },
  { title: "Blog", path: "/blog" },
  { title: "Contact Us", path: "/contact-us" },
];

export function isNavActive(pathname: string | null, link: NavLink): boolean {
  if (!pathname) return false;
  if (link.path) {
    if (link.path === "/") {
      return pathname === "/";
    }
    return pathname === link.path || pathname.startsWith(`${link.path}/`);
  }
  return (
    link.sublinks?.some(
      (sub) => pathname === sub.path || pathname.startsWith(`${sub.path}/`)
    ) ?? false
  );
}
