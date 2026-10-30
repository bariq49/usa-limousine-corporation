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
  title: "Morristown Municipal Airport Transfers (MMU)",
  description: `Premium limo transfers to and from Morristown Municipal Airport (MMU) with ${PLATFORM.name}. Professional chauffeurs available 24/7 across NJ, NY, and CT.`,
  alternates: { canonical: "/airports/morristown-mmu" },
};

export default function MorristownMmuAirportPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.AIRPORTS.MMU.BANNER}
        imageAlt="Morristown Municipal Airport terminal and private jet at twilight"
        topText="MMU · Morristown, NJ"
        title={
          <>
            Morristown Municipal Airport
            <br />
            <span className="text-primary">Transfers (MMU)</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Premium, punctual limousine service to and from MMU. Meet-and-greet, real-time flight tracking, and immaculate luxury vehicles for every ride, every time."
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
        subtitle="MMU Airport"
        title="Morristown Municipal Airport"
        paragraphs={[
          "Travel with comfort, reliability, and style through Morristown Municipal Airport with our premium limo and airport transfer services. Whether you are flying privately for business, leisure, or corporate travel, our professional chauffeurs ensure a smooth, discreet, and stress-free journey from start to finish.",
          `Located in Morristown, New Jersey, Morristown Municipal Airport (MMU) is a preferred airport for private aviation and executive travelers seeking convenient access to northern New Jersey and the New York metro area. ${PLATFORM.name} provides punctual pickups, luxury vehicles, and exceptional customer service for business travelers, VIP clients, and corporate accounts.`,
        ]}
        image={IMAGES.AIRPORTS.MMU.STORY}
        imageAlt="Professional chauffeur assisting a passenger beside a luxury sedan on the airfield"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless MMU
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
        image={IMAGES.AIRPORTS.MMU.WHY_CHOOSE_US}
        imageAlt="Chauffeur service at Morristown Municipal Airport"
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
