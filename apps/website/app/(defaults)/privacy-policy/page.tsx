import type { Metadata } from "next";
import { PLATFORM } from "@usa-limousine-corporation/config";
import PageBanner from "@/components/banner/page-banner";
import LegalContent from "@/components/legal/legal-content";
import { IMAGES } from "@/constants/image-constants";
import { PRIVACY_POLICY } from "@/constants/privacy-policy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `Learn how ${PLATFORM.name} collects, uses, discloses, retains, and protects your personal information.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.HOME.BANNER}
        imageAlt={`${PLATFORM.name} Privacy Policy`}
        topText="Legal"
        title="Privacy Policy"
        description="How we collect, use, and protect your personal information when you ride with us."
      />
      <LegalContent document={PRIVACY_POLICY} />
    </main>
  );
}
