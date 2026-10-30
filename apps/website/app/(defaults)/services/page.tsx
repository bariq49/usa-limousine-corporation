import type { Metadata } from "next";
import Link from "next/link";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { ArrowRight } from "@usa-limousine-corporation/ui/svg";
import PageBanner from "@/components/banner/page-banner";
import { IMAGES } from "@/constants/image-constants";
import { SERVICE_LINKS } from "@/constants/navigation";

export const metadata: Metadata = {
  title: "Our Services",
  description: `Chauffeured transportation from ${PLATFORM.shortName}: airport transfers, hourly hire, corporate travel and special events across New Jersey and New York.`,
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        variant="centered"
        image={IMAGES.HOME.BANNER}
        imageAlt="Our services"
        title="Our Services"
      />
      <section className="container mx-auto px-4 py-16">
        <p className="mx-auto max-w-2xl text-center text-base text-gray-600">
          {PLATFORM.description}
        </p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_LINKS.map((service) => (
            <Link
              key={service.title}
              href={service.href}
              className="group flex items-center justify-between rounded-sm border border-border bg-white p-6 transition-colors hover:border-secondary"
            >
              <span>
                <span className="block text-lg font-semibold text-black">{service.title}</span>
                <span className="mt-1 block text-sm text-gray-500">Book this ride</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-secondary transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
