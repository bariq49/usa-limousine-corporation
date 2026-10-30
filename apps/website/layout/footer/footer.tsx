"use client";

import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import FooterLinksColumn, { FooterHeading } from "./FooterLinksColumn";
import FooterBottomBar from "./FooterBottomBar";
import { Logo } from "@usa-limousine-corporation/ui/components/logo";
import { AIRPORTS, QUICK_NAV_ITEMS, SERVICE_LINKS } from "@/constants/navigation";
import { PLATFORM } from "@usa-limousine-corporation/config";
import {
  Clock,
  Facebook,
  Instagram,
  LinkedIn,
  Location,
  Mail,
  Phone,
  Pinterest,
  TikTok,
  WhatsApp,
  XLogo,
  YouTube,
} from "@usa-limousine-corporation/ui/svg";
import { Stagger, StaggerItem } from "@/components/animations";

const socialItems = [
  { label: "Facebook", href: PLATFORM.social.facebook, icon: Facebook },
  { label: "Instagram", href: PLATFORM.social.instagram, icon: Instagram },
  { label: "TikTok", href: PLATFORM.social.tiktok, icon: TikTok },
  { label: "LinkedIn", href: PLATFORM.social.linkedin, icon: LinkedIn },
  { label: "Pinterest", href: PLATFORM.social.pinterest, icon: Pinterest },
  { label: "X", href: PLATFORM.social.x, icon: XLogo },
  { label: "YouTube", href: PLATFORM.social.youtube, icon: YouTube },
  { label: "WhatsApp", href: PLATFORM.contact.whatsappHref, icon: WhatsApp },
] as const;

type ContactItem = {
  label: string;
  value: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  href?: string;
  external?: boolean;
};

const contactItems: ContactItem[] = [
  { label: "Office", value: PLATFORM.contact.address.display, icon: Location },
  { label: "Call us", value: PLATFORM.contact.phone, icon: Phone, href: PLATFORM.contact.phoneHref },
  {
    label: "WhatsApp",
    value: PLATFORM.contact.phone,
    icon: WhatsApp,
    href: PLATFORM.contact.whatsappHref,
    external: true,
  },
  { label: "Email", value: PLATFORM.contact.email, icon: Mail, href: PLATFORM.contact.emailHref },
  { label: "Availability", value: PLATFORM.contact.availability, icon: Clock },
];

function ContactRow({ item }: { item: ContactItem }) {
  const content: ReactNode = (
    <>
      <item.icon
        className="h-6 w-6 shrink-0 text-secondary"
        fill={item.icon === WhatsApp ? "currentColor" : undefined}
      />
      <span className="min-w-0">
        <span className="block text-3xs font-medium uppercase tracking-label text-gray-500">
          {item.label}
        </span>
        <span className="mt-0.5 block break-words text-sm text-gray-300 transition-colors group-hover:text-white">
          {item.value}
        </span>
      </span>
    </>
  );

  if (!item.href) {
    return <div className="group flex items-center gap-3">{content}</div>;
  }

  return (
    <Link
      href={item.href}
      target={item.external ? "_blank" : undefined}
      rel={item.external ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-3"
    >
      {content}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="w-full max-w-full overflow-x-hidden bg-night text-white">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />

      <div className="container mx-auto px-4">
        <Stagger className="flex flex-col gap-6 border-b border-white/10 py-10 lg:flex-row lg:items-end lg:justify-between">
          <StaggerItem soft className="max-w-md">
            <Logo href="/" size="lg" tone="white" />
            <p className="mt-5 text-sm leading-relaxed text-gray-400">
              {PLATFORM.description}
            </p>
          </StaggerItem>
          <StaggerItem soft>
            <p className="mb-3 text-2xs font-medium uppercase tracking-label text-gray-500">
              Follow us
            </p>
            <div className="flex max-w-xs items-center justify-between gap-3 sm:max-w-none sm:justify-start sm:gap-5">
              {socialItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="shrink-0 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <item.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </StaggerItem>
        </Stagger>

        <div className="grid gap-x-8 gap-y-12 py-12 sm:grid-cols-2 lg:flex lg:justify-between">
          <FooterLinksColumn
            title="Quick Links"
            links={QUICK_NAV_ITEMS.map((item) => ({ href: item.href, label: item.title }))}
          />

          <FooterLinksColumn
            title="Our Services"
            delay={0.08}
            links={SERVICE_LINKS.map((item) => ({ href: item.href, label: item.title }))}
          />

          <FooterLinksColumn
            title="Airports We Serve"
            delay={0.16}
            links={AIRPORTS.map((airport) => ({
              href: `/airports/${airport.slug}`,
              label: `${airport.name} (${airport.code})`,
            }))}
          />

          <Stagger delay={0.24} className="flex flex-col items-start gap-4">
            <StaggerItem soft className="mb-1">
              <FooterHeading>Contact Info</FooterHeading>
            </StaggerItem>
            {contactItems.map((item) => (
              <StaggerItem soft key={item.label} className="w-full">
                <ContactRow item={item} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      <FooterBottomBar />
    </footer>
  );
}
