import type { Metadata } from "next";
import Link from "next/link";
import { PLATFORM } from "@usa-limousine-corporation/config";
import PageBanner from "@/components/banner/page-banner";
import { IMAGES } from "@/constants/image-constants";

export const metadata: Metadata = {
  title: "Blog",
  description: `Travel tips and news from ${PLATFORM.shortName}.`,
};

export default function BlogPage() {
  return (
    <main className="min-h-screen">
      <PageBanner variant="centered" image={IMAGES.HOME_BANNER} imageAlt="Blog" title="Blog" />
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-black">Articles coming soon</h2>
        <p className="mx-auto mt-3 max-w-xl text-base text-gray-600">
          We are preparing travel tips and news for our riders. In the meantime, our team is
          available {PLATFORM.contact.availability.toLowerCase()} for any questions.
        </p>
        <Link
          href="/contact-us"
          className="mt-6 inline-flex rounded-sm bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/90"
        >
          Contact us
        </Link>
      </section>
    </main>
  );
}
