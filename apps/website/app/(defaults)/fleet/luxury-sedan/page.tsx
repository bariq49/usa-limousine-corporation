import type { Metadata } from "next";
import { PLATFORM } from "@usa-limousine-corporation/config";
import PageBanner from "@/components/banner/page-banner";
import HowItWorksSection from "@/components/shared/how-it-works-section";
import StorySection from "@/components/shared/story-section";
import TestimonialsSection from "@/components/shared/testimonials-section";
import VehicleCategoriesSection from "@/components/shared/vehicle-categories-section";
import WhyChooseUsSection from "@/components/shared/why-choose-us-section";
import { IMAGES } from "@/constants/image-constants";

export const metadata: Metadata = {
  title: "Luxury Sedan",
  description: `Book a luxury sedan with ${PLATFORM.name}: Volvo S90, Cadillac CT6 and Genesis G90 with professional chauffeurs across New Jersey and New York.`,
  alternates: { canonical: "/fleet/luxury-sedan" },
};

export default function LuxurySedanPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.FLEET.LUXURY_SEDAN.BANNER}
        imageAlt="Luxury sedan"
        topText="Luxury Sedan"
        title={
          <>
            Comfortable, Reliable Travel
            <br />
            <span className="text-primary">Without Compromise</span>
          </>
        }
        overlayClassName="bg-black/70"
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        description={`For everyday transportation that still feels like a step above, the Luxury Sedan class is ${PLATFORM.name}'s entry point into premium travel without cutting corners on comfort or safety. The Volvo S90, Cadillac CT6, and Genesis G90 all bring clean, well-maintained interiors, generous legroom, and a smooth, quiet ride, whether you're heading to a meeting, the airport, or a dinner reservation.`}
        footnote="Vehicles: Volvo S90, Cadillac CT6, Genesis G90"
        showBookingForm
      />
      <StorySection
        subtitle="Executive Sedan Class"
        title={
          <>
            Straightforward,
            <br />
            Dependable Transportation
          </>
        }
        paragraphs={[
          "The Volvo S90, Cadillac CT6, and Genesis G90 all bring clean, well-maintained interiors, generous legroom, and a smooth, quiet ride, whether you're heading to a meeting, the airport, or a dinner reservation.",
          "This is the class most clients choose for straightforward, dependable transportation: no unnecessary frills, just a comfortable seat, a professional chauffeur, and a car that gets you there smoothly.",
        ]}
        image={IMAGES.FLEET.LUXURY_SEDAN.STORY}
        imageAlt="Executive sedan"
      />
      <VehicleCategoriesSection />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Luxury Sedan
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
        image={IMAGES.FLEET.LUXURY_SEDAN.WHY_CHOOSE_US}
        imageAlt="Luxury sedan front view"
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
      <TestimonialsSection />
    </main>
  );
}
