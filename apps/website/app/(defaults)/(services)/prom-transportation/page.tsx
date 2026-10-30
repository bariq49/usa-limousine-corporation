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
  title: "Prom Transportation",
  description:
    "Safe, stylish, professional prom limo transportation for students and groups across NJ, NY, and CT.",
  alternates: { canonical: "/prom-transportation" },
};

export default function PromTransportationPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.SERVICES.PROM_TRANSPORTATION.BANNER}
        imageAlt="Luxury limousine for prom night"
        topText="Prom Transportation"
        title={
          <>
            The Fun Part of Prom Night,
            <br />
            <span className="text-primary">Without the Worry Parents Have</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Prom night is supposed to be memorable for the right reasons — and for parents, that usually starts with knowing exactly who's behind the wheel."
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
        subtitle="Prom Limo Service"
        title={"Safe, Supervised & Memorable Prom Transportation"}
        paragraphs={[
          `${PLATFORM.name} provides licensed, professional chauffeurs for prom transportation, so students get a night that feels grown-up and exciting, and parents get the peace of mind of knowing there's no teen driver navigating a big night in an unfamiliar car.`,
          "We work with groups, couples, and larger friend circles, building a schedule around dinner, photos, the dance itself, and wherever the night leads afterward — all in a vehicle that looks as good in the photos as the night feels.",
          `It's a night that only happens once — ${PLATFORM.name} helps make sure it's remembered for the right reasons, on both sides.`,
        ]}
        image={IMAGES.SERVICES.PROM_TRANSPORTATION.STORY}
        imageAlt="Professional chauffeur greeting prom guests"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Prom Night
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
        image={IMAGES.SERVICES.PROM_TRANSPORTATION.WHY_CHOOSE_US}
        imageAlt="Limousine for prom night"
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
