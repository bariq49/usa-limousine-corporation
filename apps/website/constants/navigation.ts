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
  { title: "Airport Transfers", href: "/services/airport-transfers" },
  { title: "Hourly Chauffeur", href: "/services/hourly-chauffeur" },
  { title: "Corporate Transportation", href: "/services/corporate-transportation" },
  { title: "Point-to-Point Transfers", href: "/services/point-to-point-transfers" },
  { title: "Concert Transportation", href: "/services/concert-transportation" },
  { title: "Sporting Event Transportation", href: "/services/sporting-event-transportation" },
  { title: "Wedding Transportation", href: "/services/wedding-transportation" },
  { title: "Prom Transportation", href: "/services/prom-transportation" },
  { title: "Diplomatic & Government", href: "/services/diplomatic-government-transportation" },
] as const satisfies readonly NavItem[];


export const AIRPORTS = [
  { code: "EWR", name: "Newark", slug: "newark-ewr" },
  { code: "JFK", name: "John F. Kennedy", slug: "jfk" },
  { code: "LGA", name: "LaGuardia", slug: "laguardia-lga" },
  { code: "TEB", name: "Teterboro", slug: "teterboro-teb" },
  { code: "HPN", name: "Westchester", slug: "hpn" },
  { code: "PHL", name: "Philadelphia", slug: "philadelphia-phl" },
  { code: "MMU", name: "Morristown", slug: "morristown-mmu" },
  { code: "TTN", name: "Trenton-Mercer", slug: "trenton-ttn" },
  { code: "ACY", name: "Atlantic City", slug: "atlantic-city-acy" },
  { code: "ISP", name: "MacArthur", slug: "macarthur-isp" },
  { code: "SWF", name: "Stewart", slug: "stewart-swf" },
] as const;

export const NAV_LINKS: NavLink[] = [
  { title: "Home", path: "/" },
  {
    title: "Services",
    sublinks: SERVICE_LINKS.map((service) => ({ title: service.title, path: service.href })),
  },
  {
    title: "Fleet",
    sublinks: [
      { title: "Luxury Sedan", path: "/fleet/luxury-sedan" },
      { title: "Premium Luxury Sedan", path: "/fleet/premium-luxury-sedan" },
      { title: "Luxury SUV", path: "/fleet/luxury-suv" },
      { title: "Luxury SUV w/ Bench Seat", path: "/fleet/luxury-suv-bench" },
      { title: "Premium Luxury SUV", path: "/fleet/premium-luxury-suv" },
      { title: "Passenger Van", path: "/fleet/passenger-van" },
    ],
  },
  {
    title: "Airports",
    sublinks: AIRPORTS.map((airport) => ({
      title: `${airport.name} (${airport.code})`,
      path: `/airports/${airport.slug}`,
    })),
  },
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
