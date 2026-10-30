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
  title: "Premium Luxury Sedan",
  description: `Book a premium luxury sedan with ${PLATFORM.name}: Mercedes S-Class and BMW 7 Series with professional chauffeurs for a smooth, private and refined ride.`,
  alternates: { canonical: "/premium-luxury-sedan" },
};

export default function PremiumLuxurySedanPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.FLEET.PREMIUM_LUXURY_SEDAN.BANNER}
        imageAlt="Premium luxury sedan"
        topText="Premium Luxury Sedan"
        title={
          <>
            First-Class Comfort and
            <br />
            <span className="text-primary">Sophistication</span>
          </>
        }
        overlayClassName="bg-black/70"
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        description="The Premium Luxury Sedan class is built around two of the most respected names in automotive luxury: the Mercedes S-Class and BMW 7 Series. These vehicles are designed from the ground up for a smooth, private, and quietly sophisticated ride, the kind of comfort that makes a genuine difference on a long airport run, a corporate roadshow, or a special occasion."
        footnote="Vehicles: Mercedes S-Class, BMW 7 Series"
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
        subtitle="Flagship Sedan Class"
        title={
          <>
            Quiet, Private &amp; Top-Tier
            <br />
            Refinement
          </>
        }
        paragraphs={[
          "These vehicles are designed from the ground up for a smooth, private, and quietly sophisticated ride — the kind of comfort that makes a genuine difference on a long airport run, a corporate roadshow, or a special occasion where the ride itself matters.",
          "This is the class clients choose when the trip calls for something more refined than a standard sedan — a vehicle that matches the tone of an important meeting, a milestone event, or simply a preference for traveling in the best available comfort.",
        ]}
        image={IMAGES.FLEET.PREMIUM_LUXURY_SEDAN.STORY}
        imageAlt="Premium luxury sedan interior"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Premium
            <br />
            Sedan Experience
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
        image={IMAGES.FLEET.PREMIUM_LUXURY_SEDAN.WHY_CHOOSE_US}
        imageAlt="Premium luxury sedan"
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
