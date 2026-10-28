import type { Metadata } from "next";
import { PLATFORM } from "@usa-limousine-corporation/config";
import PageBanner from "@/components/banner/page-banner";
import { IMAGES } from "@/constants/image-constants";
import { AIRPORTS } from "@/constants/navigation";

export const metadata: Metadata = {
  title: "About Us",
  description: `${PLATFORM.name}: ${PLATFORM.description}`,
};

const HIGHLIGHTS = [
  { label: "Availability", value: PLATFORM.contact.availability },
  { label: "Based in", value: PLATFORM.contact.address.display },
  { label: "Airports served", value: `${AIRPORTS.length} airports` },
];

export default function AboutUsPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        variant="centered"
        image={IMAGES.HOME_BANNER}
        imageAlt="About us"
        title="About Us"
      />
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-black">{PLATFORM.name}</h2>
          <p className="mt-4 text-base leading-relaxed text-gray-600">{PLATFORM.description}</p>
        </div>
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <div key={item.label} className="rounded-sm border border-border bg-white p-6 text-center">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="mt-1 text-lg font-semibold text-black">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mx-auto mt-10 max-w-3xl">
          <h3 className="text-center text-lg font-semibold text-black">Airports we serve</h3>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {AIRPORTS.map((airport) => (
              <span
                key={airport.code}
                className="rounded-full border border-border px-3 py-1 text-sm text-gray-700"
              >
                {airport.code} · {airport.name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
