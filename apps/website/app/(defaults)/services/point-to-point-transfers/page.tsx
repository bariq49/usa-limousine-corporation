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
  title: "Point-to-Point Transfers",
  description:
    "Simple, direct, fixed-rate point-to-point chauffeur transfers. Direct routing with no meter running and no hidden fees.",
  alternates: { canonical: "/services/point-to-point-transfers" },
};

export default function PointToPointTransfersPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.SERVICES.POINT_TO_POINT_TRANSFERS.BANNER}
        imageAlt="Luxury vehicle for point to point transfers"
        topText="Point-to-Point Transfers"
        title={
          <>
            The Ride You Actually Want:
            <br />
            <span className="text-primary">Simple, Direct, No Surprises</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Not every trip needs an hourly reservation or a package of add-ons — sometimes you just need to get from one place to another, comfortably, and know the price before you get in the car."
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
        subtitle="Direct Transfers"
        title={"Fixed Rates & Professional Chauffeur Standard"}
        paragraphs={[
          "That's the entire idea behind point-to-point service. You tell us where you're starting and where you're headed; we quote a fixed price upfront and deliver a direct, no-detour ride to your destination.",
          "There's no meter running, no algorithm adjusting the fare mid-ride, and no chauffeur unsure of the route. Just a clear price agreed on in advance and a driver who takes you straight there.",
          "Point-to-point is our answer to the question 'I just need a ride there and that's it' — no complexity, no upsell, just a dependable, comfortable trip at a price you already know.",
        ]}
        image={IMAGES.SERVICES.POINT_TO_POINT_TRANSFERS.STORY}
        imageAlt="Chauffeur holding door for point-to-point transfer passenger"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Point-to-Point
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
        image={IMAGES.SERVICES.POINT_TO_POINT_TRANSFERS.WHY_CHOOSE_US}
        imageAlt="Luxury vehicle ready for a direct transfer"
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
