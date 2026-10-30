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
  title: "Hourly Chauffeur",
  description:
    "Book a private chauffeur by the hour for business meetings, events, shopping, or city travel. Flexible luxury transportation on your schedule.",
  alternates: { canonical: "/services/hourly-chauffeur" },
};

export default function HourlyChauffeurPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.SERVICES.HOURLY_CHAUFFEUR.BANNER}
        imageAlt="Private chauffeur standing beside luxury vehicle for hourly service"
        topText="Hourly Chauffeur Services"
        title={
          <>
            One Reservation.
            <br />
            <span className="text-primary">A Driver for However Long You Need.</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Not every trip fits neatly into a single pickup and drop-off. Some days call for a driver who sticks around — through a string of meetings, a shopping trip, or an afternoon showing visiting family around the city."
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
        subtitle="Hourly Chauffeur Service"
        title={"Flexibility for Days That Don't Follow a Fixed Schedule"}
        paragraphs={[
          "That's what hourly chauffeur service is built for: you book a block of time, and your chauffeur and vehicle are yours for the duration, adapting as your plans shift in real time.",
          "There's no re-booking between stops and no explaining your itinerary to a new driver every hour. The same chauffeur who picks you up in the morning is still behind the wheel when your day wraps up, already familiar with where you've been and where you're headed next.",
          "Hourly service is less about getting from A to B, and more about having someone else handle the driving while your day unfolds however it needs to.",
        ]}
        image={IMAGES.SERVICES.HOURLY_CHAUFFEUR.STORY}
        imageAlt="Executive chauffeur waiting by luxury vehicle"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Hourly Chauffeur
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
        image={IMAGES.SERVICES.HOURLY_CHAUFFEUR.WHY_CHOOSE_US}
        imageAlt="Chauffeur ready for an hourly booking"
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
