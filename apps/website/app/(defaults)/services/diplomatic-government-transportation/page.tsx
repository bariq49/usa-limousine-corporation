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
  title: "Diplomatic & Government Transportation",
  description:
    "Discreet, security-conscious chauffeur transportation for diplomats, delegations, and government VIPs in NY and the tri-state area.",
  alternates: { canonical: "/services/diplomatic-government-transportation" },
};

export default function DiplomaticGovernmentTransportationPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.SERVICES.DIPLOMATIC_GOVERNMENT_TRANSPORTATION.BANNER}
        imageAlt="Executive diplomatic chauffeur vehicle"
        topText="Diplomatic & Government"
        title={
          <>
            Transportation Held to the Standard
            <br />
            <span className="text-primary">That Role Requires</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Diplomatic and government transportation isn't just a higher tier of luxury service — it's a different category of requirement altogether. Discretion, punctuality, and security-conscious professionalism aren't extras; they're the baseline."
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
        subtitle="Diplomatic Service"
        title={"Protocol-Vetted Chauffeurs & Strict Confidentiality"}
        paragraphs={[
          `${PLATFORM.name} provides chauffeur transportation for diplomats, consular officials, international delegations, and government or executive VIP guests throughout New York and the tri-state area with exactly that standard in mind.`,
          "Our chauffeurs supporting this work are selected and briefed specifically for the sensitivity these engagements require — schedules that can shift with little notice, routes that may need to be adjusted for security reasons, and a level of discretion that extends to not discussing passengers, routes, or itineraries.",
          `For transportation where discretion and reliability aren't preferences but requirements, ${PLATFORM.name} is built to meet that standard.`,
        ]}
        image={IMAGES.SERVICES.DIPLOMATIC_GOVERNMENT_TRANSPORTATION.STORY}
        imageAlt="Diplomatic chauffeur assisting delegation"
      />
      <VehicleCategoriesSection />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Diplomatic
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
        image={IMAGES.SERVICES.DIPLOMATIC_GOVERNMENT_TRANSPORTATION.WHY_CHOOSE_US}
        imageAlt="Executive vehicle for diplomatic transportation"
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
