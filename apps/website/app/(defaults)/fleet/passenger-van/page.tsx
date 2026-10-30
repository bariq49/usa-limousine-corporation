import type { Metadata } from "next";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { CircleCheck, Clock, Star } from "@usa-limousine-corporation/ui/svg";
import PageBanner from "@/components/banner/page-banner";
import HowItWorksSection from "@/components/shared/how-it-works-section";
import StatsBar from "@/components/shared/stats-bar";
import StorySection from "@/components/shared/story-section";
import TestimonialsSection from "@/components/shared/testimonials-section";
import VehicleCategoriesSection from "@/components/shared/vehicle-categories-section";
import WhyChooseUsSection from "@/components/shared/why-choose-us-section";
import { IMAGES } from "@/constants/image-constants";

export const metadata: Metadata = {
  title: "Passenger Van",
  description: `Book a passenger van with ${PLATFORM.name}: Mercedes Sprinter and Ford Transit with professional chauffeurs, elegant interiors and room for the whole group.`,
  alternates: { canonical: "/fleet/passenger-van" },
};

export default function PassengerVanPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.FLEET.PASSENGER_VAN.BANNER}
        imageAlt="Passenger van"
        topText="Passenger Van"
        title={
          <>
            Room for the Whole Group,
            <br />
            <span className="text-primary">Without Sacrificing Comfort</span>
          </>
        }
        overlayClassName="bg-black/70"
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        description={`When a group needs to travel together, the Passenger Van class, built on the Mercedes Sprinter and Ford Transit, offers elegant interiors and real extra room without losing the comfort and polish that defines every ${PLATFORM.name} ride.`}
        footnote="Vehicles: Mercedes Sprinter, Ford Transit"
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
        subtitle="Group Travel Van"
        title={
          <>
            Elegant Interiors &amp; Real
            <br />
            Extra Space
          </>
        }
        paragraphs={[
          `Built on the Mercedes Sprinter and Ford Transit, this class offers elegant interiors and real extra room without losing the comfort and polish that defines every ${PLATFORM.name} ride.`,
          "It's a practical, premium solution for larger parties who'd rather travel in one vehicle than split across several cars.",
        ]}
        image={IMAGES.FLEET.PASSENGER_VAN.STORY}
        imageAlt="Passenger van interior"
      />
      <VehicleCategoriesSection />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Passenger Van
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
        image={IMAGES.FLEET.PASSENGER_VAN.WHY_CHOOSE_US}
        imageAlt="Passenger van"
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
