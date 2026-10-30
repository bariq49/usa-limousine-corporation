import type { Metadata } from "next";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { CircleCheck, Clock, Star } from "@usa-limousine-corporation/ui/svg";
import PageBanner from "@/components/banner/page-banner";
import HowItWorksSection from "@/components/shared/how-it-works-section";
import StatsBar from "@/components/shared/stats-bar";
import StorySection from "@/components/shared/story-section";
import WhyChooseUsSection from "@/components/shared/why-choose-us-section";
import { IMAGES } from "@/constants/image-constants";

export const metadata: Metadata = {
  title: "Premium Luxury SUV",
  description: `Book a premium luxury SUV with ${PLATFORM.name}: Cadillac Escalade ESV and Lincoln Navigator L with professional chauffeurs, spacious interiors and flagship amenities.`,
  alternates: { canonical: "/fleet/premium-luxury-suv" },
};

export default function PremiumLuxurySuvPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.FLEET.PREMIUM_LUXURY_SUV.BANNER}
        imageAlt="Premium luxury SUV"
        topText="Premium Luxury SUV"
        title={
          <>
            The Top-Tier <span className="text-primary">SUV Experience</span>
          </>
        }
        overlayClassName="bg-black/70"
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        description="For clients who want the space of an SUV paired with the amenities and presence of a flagship vehicle, the Premium Luxury SUV class delivers. The Cadillac Escalade ESV and Lincoln Navigator L are the largest, most amenity-rich SUVs in our fleet, with spacious interiors, premium materials throughout, and a ride quality built for extended comfort."
        footnote="Vehicles: Cadillac Escalade ESV, Lincoln Navigator L"
        showBookingForm
      />
      <StatsBar
        items={[
          {
            icon: <Star className="h-5 w-5" />,
            title: "30+ Years Combined Experience",
            description: "Professional chauffeurs with deep local expertise",
          },
          {
            icon: <Clock className="h-5 w-5" />,
            title: "24/7 Availability",
            description: "Always on call, we are never more than a message away",
          },
          {
            icon: <CircleCheck className="h-5 w-5" />,
            title: "Certified, Verified Fleet",
            description: "Fully licensed, insured, and rigorously maintained vehicles",
          },
        ]}
      />
      <StorySection
        subtitle="Flagship SUV Class"
        title={
          <>
            Flagship Vehicle Amenities
            <br />
            &amp; Presence
          </>
        }
        paragraphs={[
          "The Cadillac Escalade ESV and Lincoln Navigator L are the largest, most amenity-rich SUVs in our fleet — spacious interiors, premium materials throughout, and a ride quality built for extended comfort, not just capacity.",
          "This class is a favorite for airport arrivals that need to make an impression, executive travel where the vehicle itself is part of the experience, and family trips where comfort matters as much as space.",
        ]}
        image={IMAGES.FLEET.PREMIUM_LUXURY_SUV.STORY}
        imageAlt="Premium luxury SUV interior"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Premium SUV
            <br />
            Experience
          </>
        }
        subtitle="From curbside pickup to door-to-door drop-off, we handle every detail so your airport journey is stress-free, comfortable, and on time."
        features={[
          {
            title: "Real-Time Flight Tracking",
            description:
              "We monitor your flight live. If it's delayed, your chauffeur adjusts automatically, so your pickup stays seamless.",
          },
          {
            title: "Punctual Meet & Greet",
            description:
              "Your professional chauffeur meets you at baggage claim with a personalized name sign and helps with your luggage.",
          },
          {
            title: "Immaculate Luxury Fleet",
            description:
              "Choose from executive sedans, SUVs, stretch limos, and vans - every vehicle is meticulously maintained.",
          },
          {
            title: "Background-Checked Chauffeurs",
            description:
              "All drivers are licensed, insured, and thoroughly vetted to deliver safe, discreet, premium service.",
          },
        ]}
        image={IMAGES.FLEET.PREMIUM_LUXURY_SUV.WHY_CHOOSE_US}
        imageAlt="Premium luxury SUV"
      />
      <HowItWorksSection
        badge="Simple Process"
        title={
          <>
            How It <span className="text-primary">Works</span>
          </>
        }
        steps={[
          {
            title: "Book Online or Call",
            description: `Reserve via our website, call ${PLATFORM.contact.phone}, or WhatsApp us. Instant confirmation provided.`,
          },
          {
            title: "We Track Your Flight",
            description:
              "Our dispatch team monitors your flight in real-time. Delays, early arrivals, and gate changes are handled automatically.",
          },
          {
            title: "Chauffeur Meets You",
            description:
              "Your driver greets you at baggage claim with a personalized name board, assists with luggage, and escorts you to the vehicle.",
          },
          {
            title: "Arrive in Comfort",
            description:
              "Relax in your luxury vehicle to your destination. No surprises, no stress, just a smooth premium ride.",
          },
        ]}
      />
    </main>
  );
}
