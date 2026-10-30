import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ASSETS } from "@usa-limousine-corporation/ui/assets";
import { Logo } from "@usa-limousine-corporation/ui/components/logo";
import { CircleHelp } from "@usa-limousine-corporation/ui/svg";

export const metadata: Metadata = {
  title: "Authentication",
};

export default function AuthGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="loginwrapper relative flex min-h-dvh flex-col bg-card md:items-center md:justify-center md:overflow-hidden md:bg-transparent">
      <img
        src={ASSETS.auth.dark.src}
        alt=""
        className="absolute top-0 left-0 hidden h-full w-full object-cover md:dark:block"
      />
      <img
        src={ASSETS.auth.light.src}
        alt=""
        className="absolute top-0 left-0 hidden h-full w-full object-cover md:block md:dark:hidden"
      />

      <div className="sticky top-0 z-0 h-64 shrink-0 overflow-hidden sm:h-72 md:hidden">
        <img
          src={ASSETS.auth.mobile.src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/50" />
        <div className="relative z-10 flex items-center justify-between px-6 pt-7">
          <Logo href="/" tone="white" className="h-10 w-48" />
          <a
            href={`${process.env["NEXT_PUBLIC_WEBSITE_URL"]}/contact-us`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
          >
            <CircleHelp className="h-5 w-5" />
            Help
          </a>
        </div>
      </div>

      <a
        href={`${process.env["NEXT_PUBLIC_WEBSITE_URL"]}/contact-us`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-6 right-6 z-20 hidden h-10 items-center gap-1.5 text-sm font-semibold text-default-900 transition-opacity hover:opacity-80 md:inline-flex"
      >
        <CircleHelp className="h-5 w-5" />
        Help
      </a>

      <div className="relative z-10 -mt-12 w-full flex-1 rounded-t-3xl bg-card px-6 pt-8 pb-10 md:m-4 md:mt-0 md:max-w-xl md:flex-none md:rounded-xl md:p-10 xl:p-12 2xl:p-16">
        {children}
      </div>
    </div>
  );
}
