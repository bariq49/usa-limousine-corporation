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
  title: "Sporting Event Transportation",
  description:
    "Game day chauffeur transportation to major stadiums across the tri-state area. Seamless pre-game drop-off and post-game pickups.",
  alternates: { canonical: "/sporting-event-transportation" },
};

export default function SportingEventTransportationPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.SERVICES.SPORTING_EVENT_TRANSPORTATION.BANNER}
        imageAlt="Luxury vehicle for sporting event transportation"
        topText="Sporting Event Transportation"
        title={
          <>
            Built for Game Day —
            <br />
            <span className="text-primary">Including the Part After the Game</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Getting to a stadium is rarely the hard part of game day. It's the exit — thousands of fans, gridlocked lots, and a 'quick pickup' that turns into forty-five minutes of standing around."
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
        subtitle="Stadium Transportation"
        title={"Chauffeurs Who Know Stadium Traffic & Game Day Flow"}
        paragraphs={[
          `${PLATFORM.name} is built specifically to handle that side of the experience, with chauffeurs who know stadium traffic patterns and post-game pickups that account for the fact that games almost never end exactly on time.`,
          "We work with fans heading to the game with friends, families making a day of it, and corporate groups entertaining clients in suites — all needing the same thing: reliable transportation that doesn't fall apart the moment the final whistle blows.",
          "Game day should end with celebrating the win — or shaking off the loss — not fighting your way out of a parking lot.",
        ]}
        image={IMAGES.SERVICES.SPORTING_EVENT_TRANSPORTATION.STORY}
        imageAlt="Chauffeur waiting by SUV for stadium transfer"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Sporting Event
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
        image={IMAGES.SERVICES.SPORTING_EVENT_TRANSPORTATION.WHY_CHOOSE_US}
        imageAlt="Luxury SUV for game day transportation"
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
