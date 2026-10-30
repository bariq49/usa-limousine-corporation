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
  title: "John F. Kennedy International Airport Transfers (JFK)",
  description: `Premium limo transfers to and from John F. Kennedy International Airport (JFK) with ${PLATFORM.name}. Professional chauffeurs available 24/7 across NJ, NY, and CT.`,
  alternates: { canonical: "/airports/jfk" },
};

export default function JfkAirportPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.AIRPORTS.JFK.BANNER}
        imageAlt="JFK Airport terminal exterior at sunset"
        topText="JFK · Queens, NY"
        title={
          <>
            John F. Kennedy International Airport
            <br />
            <span className="text-primary">Transfers (JFK)</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Premium, punctual limousine service to and from JFK. Meet-and-greet, real-time flight tracking, and immaculate luxury vehicles for every ride, every time."
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
        subtitle="JFK Airport"
        title="John F. Kennedy International Airport"
        paragraphs={[
          "Travel with comfort, reliability, and style through John F. Kennedy International Airport with our premium limo and airport transfer services. Whether you are arriving in New York, heading to Manhattan, or catching an international flight, our professional chauffeurs ensure a smooth and stress-free journey from start to finish.",
          "Located in Queens, New York City, John F. Kennedy International Airport (JFK) is one of the busiest and most recognized airports in the world, welcoming millions of travelers each year. Our airport transfer service is designed to provide punctual pickups, luxury transportation, and exceptional customer care for business travelers, families, tourists, and corporate clients.",
        ]}
        image={IMAGES.AIRPORTS.JFK.STORY}
        imageAlt="Premium SUV with Manhattan skyline in the background"
      />
      <VehicleCategoriesSection />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless JFK
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
        image={IMAGES.AIRPORTS.JFK.WHY_CHOOSE_US}
        imageAlt="Chauffeur service at John F. Kennedy International Airport"
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
