import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PLATFORM } from "@usa-limousine-corporation/config";
import Step1 from "@usa-limousine-corporation/ui/components/bookings/step-1";
import { ArrowLeft, Check } from "@usa-limousine-corporation/ui/svg";
import { IMAGES } from "@/constants/image-constants";

export const metadata: Metadata = {
  title: "Book a Ride",
  description: `Reserve a professional chauffeur with ${PLATFORM.name} in a few simple steps. Your rate is confirmed before you travel.`,
  alternates: { canonical: "/book-ride" },
};

export default function BookRidePage() {
  return (
    <section className="grid min-h-dvh w-full grid-cols-1 bg-cream-300 lg:grid-cols-12">
      <div className="relative hidden flex-col justify-end overflow-hidden bg-black lg:col-span-5 lg:flex">
        <Image
          src={IMAGES.HOME.BANNER}
          alt={`${PLATFORM.name} professional chauffeur`}
          fill
          priority
          sizes="42vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />

        <div className="relative z-10 px-10 py-14 xl:px-14">
          <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
            Private travel, perfected
          </span>
          <h1 className="mt-4 text-4xl leading-tight font-semibold tracking-tight text-white xl:text-5xl">
            Your journey begins here.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            Reserve a professional chauffeur in a few simple steps. Your rate is confirmed before
            you travel.
          </p>

          <ul className="mt-8 space-y-3 border-t border-white/15 pt-8">
            {[
              "All-inclusive fixed pricing",
              "Complimentary airport wait time",
              "24/7 live support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-white/85">
                <Check className="h-4 w-4 shrink-0 text-secondary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col px-4 pt-6 sm:px-8 lg:col-span-7 lg:px-12 lg:py-12 xl:px-16">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-neutral-600 uppercase transition-colors hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <a
            href={PLATFORM.contact.phoneHref}
            className="text-sm text-neutral-600 transition-colors hover:text-black"
          >
            Need help? <span className="font-semibold text-black">{PLATFORM.contact.phone}</span>
          </a>
        </div>

        <div className="mt-8 lg:mt-auto lg:pt-10">
          <span className="text-xs font-semibold tracking-widest text-secondary uppercase">
            Book your ride
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Where can we take you?
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
            Enter your pickup and drop-off details, choose a date and time, and we will show you the
            vehicles available for your trip with fixed, all-inclusive pricing.
          </p>
        </div>

        <div className="-mx-4 mt-8 flex flex-1 flex-col sm:-mx-8 lg:mx-0 lg:flex-none">
          <Step1 className="max-w-none flex-1" formClassName="flex-1 md:shadow-none" />
          <p className="mt-6 hidden text-center text-xs text-neutral-500 lg:block">
            Your information is encrypted and used only to arrange your transportation.
          </p>
        </div>
      </div>
    </section>
  );
}
