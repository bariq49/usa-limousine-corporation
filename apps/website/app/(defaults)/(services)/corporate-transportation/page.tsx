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
  title: "Corporate Transportation",
  description:
    "Punctual, polished corporate transportation programs for executives, clients, and corporate accounts across NJ, NY, and CT.",
  alternates: { canonical: "/corporate-transportation" },
};

export default function CorporateTransportationPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.SERVICES.CORPORATE_TRANSPORTATION.BANNER}
        imageAlt="Executive corporate transportation chauffeur"
        topText="Corporate Transportation"
        title={
          <>
            Transportation That Reflects on Your Company,
            <br />
            <span className="text-primary">Not Just Gets You There</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "When a client, executive, or job candidate steps off a plane and into a car you arranged, that ride is already part of their impression of your business — before a single meeting has started."
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
        subtitle="Corporate Account Service"
        title={"Punctual, Polished, and Consistent Transportation"}
        paragraphs={[
          `${PLATFORM.name} builds corporate transportation programs around that reality: punctual, polished, and consistent, whether it's a single airport pickup or an ongoing account for a whole organization.`,
          "We work with businesses that need transportation to simply work, every time, without someone internally having to manage it trip by trip. That means chauffeurs trained specifically for corporate settings — used to formal introductions, quiet rides for phone calls or last-minute prep, and schedules that shift on short notice.",
          `Corporate transportation from ${PLATFORM.name} isn't just about the ride — it's about giving your company one less variable to manage when it comes to how your people, clients, and guests move.`,
        ]}
        image={IMAGES.SERVICES.CORPORATE_TRANSPORTATION.STORY}
        imageAlt="Corporate executive chauffeur assisting client"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Corporate Transportation
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
        image={IMAGES.SERVICES.CORPORATE_TRANSPORTATION.WHY_CHOOSE_US}
        imageAlt="Corporate chauffeur with executive vehicle"
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
