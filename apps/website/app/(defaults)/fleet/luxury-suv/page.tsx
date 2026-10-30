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
  title: "Luxury SUV",
  description: `Book a luxury SUV with ${PLATFORM.name}: Chevrolet Suburban, GMC Yukon XL and Ford Expedition with professional chauffeurs for groups, luggage and comfort.`,
  alternates: { canonical: "/fleet/luxury-suv" },
};

export default function LuxurySuvPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.FLEET.LUXURY_SUV.BANNER}
        imageAlt="Luxury SUV"
        topText="Luxury SUV"
        title={
          <>
            First-Class Space for Groups,
            <br />
            <span className="text-primary">Luggage, and Comfort</span>
          </>
        }
        overlayClassName="bg-black/70"
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        description="When a sedan isn't enough room, the Luxury SUV class steps in. Built on the Chevrolet Suburban, GMC Yukon XL, and Ford Expedition, these vehicles offer generous passenger space and an elevated ride that works equally well for a family airport run, a group of colleagues heading to a meeting, or a night out that needs more than four seats."
        footnote="Vehicles: Chevrolet Suburban, GMC Yukon XL, Ford Expedition"
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
        subtitle="Premium SUV Class"
        title={
          <>
            Generous Space for
            <br />
            Passengers &amp; Luggage
          </>
        }
        paragraphs={[
          "Works equally well for a family airport run, a group of colleagues heading to a meeting, or a night out that needs more than four seats.",
          "The extra room isn't just about passengers — these SUVs comfortably handle luggage-heavy airport trips and event transportation where space matters as much as comfort.",
        ]}
        image={IMAGES.FLEET.LUXURY_SUV.STORY}
        imageAlt="Luxury SUV side view"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Luxury SUV
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
        image={IMAGES.FLEET.LUXURY_SUV.WHY_CHOOSE_US}
        imageAlt="Luxury SUV interior"
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
