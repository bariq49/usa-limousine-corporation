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
  title: "Concert Transportation",
  description:
    "Chauffeur transportation to concerts, festivals, and live events across NY and the tri-state area. Skip venue parking and surge pricing.",
  alternates: { canonical: "/services/concert-transportation" },
};

export default function ConcertTransportationPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.SERVICES.CONCERT_TRANSPORTATION.BANNER}
        imageAlt="Luxury concert transportation chauffeur"
        topText="Concert Transportation"
        title={
          <>
            Skip the Parking Lot Chaos.
            <br />
            <span className="text-primary">Just Enjoy the Show.</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Anyone who's circled a venue's parking garage while the opening act starts knows the real cost of driving yourself to a concert isn't the ticket — it's everything around it."
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
        subtitle="Event Chauffeur Service"
        title={"Timed Around Your Show, Not a Generic Pickup Window"}
        paragraphs={[
          `${PLATFORM.name} handles that part. We provide chauffeur transportation to concerts, festivals, and live events across New York and the tri-state area, timed around your show, not a generic pickup window.`,
          "That means we plan around openers, encores, and everything in between — including the reality that a show rarely ends exactly on schedule. Your chauffeur is tracking the event, not just the clock, so you're not left waiting outside in a crowd trying to find a rideshare that's surging at 4x price.",
          `Let the show be the only thing you have to think about — ${PLATFORM.name} handles the rest.`,
        ]}
        image={IMAGES.SERVICES.CONCERT_TRANSPORTATION.STORY}
        imageAlt="Executive limo for concert event transfers"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Concert Event
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
        image={IMAGES.SERVICES.CONCERT_TRANSPORTATION.WHY_CHOOSE_US}
        imageAlt="Chauffeur service for a concert night"
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
