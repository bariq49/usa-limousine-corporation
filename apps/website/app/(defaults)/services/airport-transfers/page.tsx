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
  title: "Airport Transfers",
  description: `Airport transfers with ${PLATFORM.name} to and from EWR, JFK, LGA and Teterboro with real-time flight tracking and professional chauffeurs across New Jersey and New York.`,
  alternates: { canonical: "/services/airport-transfers" },
};

export default function AirportTransfersPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.SERVICES.AIRPORT_TRANSFERS.BANNER}
        imageAlt="Airport transfer chauffeur"
        topText="Airport Transfers"
        title={
          <>
            Never Watch the Clock Before a
            <br />
            <span className="text-primary">Flight Again</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description="Missing a flight, or worse, sitting at baggage claim wondering if your ride is coming, is a special kind of stress."
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
        subtitle="Airport Transfer Service"
        title="Dedicated Airport Transportation Across NJ, NY & Surrounding Regions"
        paragraphs={[
          `${PLATFORM.name} exists to take that worry off your plate entirely. We run dedicated airport transportation to and from every major airport in New Jersey, New York, and the surrounding region, including Newark Liberty (EWR), JFK, LaGuardia (LGA), and Teterboro, built around one simple promise: your chauffeur is there when you need them, not when it's convenient for us.`,
          "Behind the scenes, every airport run is tied to live flight data. If your flight lands early, your chauffeur already knows. If it's delayed two hours on the tarmac, we're tracking that too — so you're never left waiting outside a terminal for a driver who thought you'd already landed, and you're never rushing a driver who shows up late.",
        ]}
        image={IMAGES.SERVICES.AIRPORT_TRANSFERS.STORY}
        imageAlt="Chauffeur opening the door at the airport"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Airport
            <br />
            Transfers Experience
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
        image={IMAGES.SERVICES.AIRPORT_TRANSFERS.WHY_CHOOSE_US}
        imageAlt="Chauffeur welcoming a passenger"
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
