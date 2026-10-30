import type { Metadata } from "next";
import { PLATFORM } from "@usa-limousine-corporation/config";
import PageBanner from "@/components/banner/page-banner";
import LegalContent from "@/components/legal/legal-content";
import { IMAGES } from "@/constants/image-constants";
import { TERMS_AND_CONDITIONS } from "@/constants/terms-and-conditions";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: `Terms & Conditions for using the ${PLATFORM.name} website and booking chauffeured transportation services.`,
  alternates: { canonical: "/terms-and-conditions" },
};

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.HOME.BANNER}
        imageAlt={`${PLATFORM.name} Terms & Conditions`}
        topText="Legal"
        title="Terms & Conditions"
        description="Please review these terms carefully before completing a reservation with us."
      />
      <LegalContent document={TERMS_AND_CONDITIONS} />
    </main>
  );
}
