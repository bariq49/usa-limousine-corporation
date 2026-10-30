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
  title: "LaGuardia Airport Transfers (LGA)",
  description: `Premium limo transfers to and from LaGuardia Airport (LGA) with ${PLATFORM.name}. Professional chauffeurs available 24/7 across NJ, NY, and CT.`,
  alternates: { canonical: "/airports/laguardia-lga" },
};

export default function LaguardiaLgaAirportPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.AIRPORTS.LGA.BANNER}
        imageAlt="LaGuardia Airport terminal and taxiway"
        topText="LGA · Queens, NY"
        title={
          <>
            LaGuardia Airport
            <br />
            <span className="text-primary">Transfers (LGA)</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Premium, punctual limousine service to and from LaGuardia Airport. Enjoy professional chauffeur service, real-time flight tracking, and luxury vehicles designed for comfort and reliability."
        }
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
        subtitle="LGA Airport"
        title="LaGuardia International Airport"
        paragraphs={[
          "Travel in comfort and style with our premium limo and airport transfer services to and from LaGuardia Airport. Whether you are arriving in New York City, heading to your hotel, attending a business meeting, or catching a flight, our experienced chauffeurs ensure a smooth and hassle-free journey from beginning to end.",
          "Located in Queens, New York, LaGuardia Airport (LGA) is one of the busiest domestic airports in the United States, serving millions of passengers every year. Known for its convenient access to Manhattan and surrounding boroughs, LGA is a preferred airport for both business and leisure travelers.",
        ]}
        image={IMAGES.AIRPORTS.LGA.STORY}
        imageAlt="Luxury SUV pickup with Manhattan skyline view"
      />
      <VehicleCategoriesSection />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless LGA
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
        image={IMAGES.AIRPORTS.LGA.WHY_CHOOSE_US}
        imageAlt="Chauffeur service at LaGuardia Airport"
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
