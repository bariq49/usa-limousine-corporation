"use client";

import Link from "next/link";
import { ArrowRight } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@/lib/utils";
import { Stagger, StaggerItem } from "@/components/animations";

export interface FooterLinkItem {
  href: string;
  label: string;
}

interface FooterLinksColumnProps {
  title: string;
  links: FooterLinkItem[];
  className?: string;
  /** Extra delay before this column’s cascade starts */
  delay?: number;
}

/** Section heading with the gold accent bar used across the footer. */
export function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-label text-white">
      {children}
      <span className="mt-3 block h-0.5 w-8 rounded-full bg-secondary" />
    </h3>
  );
}

/** Title then each link — one by one (StaggerItems must be direct children) */
export default function FooterLinksColumn({
  title,
  links,
  className,
  delay = 0,
}: FooterLinksColumnProps) {
  return (
    <Stagger
      delay={delay}
      className={cn("flex w-full flex-col items-start gap-3 lg:w-auto", className)}
    >
      <StaggerItem soft className="mb-2">
        <FooterHeading>{title}</FooterHeading>
      </StaggerItem>

      {links.map((item) => (
        <StaggerItem soft key={item.label}>
          <Link
            href={item.href}
            className="group inline-flex items-start gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowRight className="mt-0.75 h-3.5 w-3.5 shrink-0 text-secondary transition-transform duration-200 group-hover:translate-x-1" />
            <span>{item.label}</span>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
