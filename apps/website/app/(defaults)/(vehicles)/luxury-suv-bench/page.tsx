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
  title: "Luxury SUV with Bench Seat",
  description: `Book a luxury SUV with bench seating from ${PLATFORM.name}: extra passenger capacity in a Chevrolet Suburban, GMC Yukon XL or Ford Expedition with professional chauffeurs.`,
  alternates: { canonical: "/luxury-suv-bench" },
};

export default function LuxurySuvBenchPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.FLEET.LUXURY_SUV_BENCH.BANNER}
        imageAlt="Luxury SUV with bench seat"
        topText="Luxury SUV w/ Bench Seat"
        title={
          <>
            Extra Seating Capacity Without
            <br />
            <span className="text-primary">Losing the Premium Feel</span>
          </>
        }
        overlayClassName="bg-black/70"
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        description="Configured with a bench seat, this version of our Luxury SUV class, built on the same Chevrolet Suburban, GMC Yukon XL, and Ford Expedition platforms, adds passenger capacity for larger groups while keeping the leather seating and smooth ride that define our premium fleet."
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
        subtitle="Expanded Capacity SUV"
        title={
          <>
            Practical Choice for
            <br />
            Larger Groups
          </>
        }
        paragraphs={[
          "Configured with a bench seat, this version of our Luxury SUV class adds passenger capacity for larger groups while keeping the leather seating and smooth ride that define our premium fleet.",
          "It's the practical choice when your group is just a bit too large for standard SUV seating but doesn't need a full passenger van.",
        ]}
        image={IMAGES.FLEET.LUXURY_SUV_BENCH.STORY}
        imageAlt="Expanded capacity SUV"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Luxury SUV
            <br />
            Bench Experience
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
        image={IMAGES.FLEET.LUXURY_SUV_BENCH.WHY_CHOOSE_US}
        imageAlt="Luxury SUV on the road"
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
