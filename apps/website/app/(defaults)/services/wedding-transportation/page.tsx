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
  title: "Wedding Transportation",
  description:
    "Immaculate wedding limo and chauffeur transportation for couples, bridal parties, and guests across NJ, NY, and CT.",
  alternates: { canonical: "/services/wedding-transportation" },
};

export default function WeddingTransportationPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.SERVICES.WEDDING_TRANSPORTATION.BANNER}
        imageAlt="Luxury wedding limousine chauffeur"
        topText="Wedding Transportation"
        title={
          <>
            The One Detail That
            <br />
            <span className="text-primary">Has to Run on Time</span>
          </>
        }
        titleClassName="text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-5xl"
        overlayClassName="bg-black/70"
        description={
          "Of all the moving pieces on a wedding day, transportation is one of the least forgiving — photographers can adjust, caterers can hold a course, but a ceremony can't easily wait on a car stuck in traffic."
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
        subtitle="Wedding Day Service"
        title={"Flawless Coordination for Couples, Bridal Parties & Guests"}
        paragraphs={[
          `${PLATFORM.name} treats wedding transportation with that level of seriousness, coordinating closely with couples, planners, and venues so every pickup lands exactly when it needs to.`,
          "We handle transportation for the couple, the bridal party, and family members across the full arc of the day — from getting-ready locations to the ceremony, through photos, and on to the reception — with vehicles chosen to complement the day's style, not just get people from place to place.",
          `On a day with a hundred details, transportation is one you shouldn't have to think about twice — ${PLATFORM.name} makes sure it isn't.`,
        ]}
        image={IMAGES.SERVICES.WEDDING_TRANSPORTATION.STORY}
        imageAlt="Chauffeur assisting wedding party"
      />
      <WhyChooseUsSection
        variant="split"
        badge="Why Choose Us"
        title={
          <>
            Your Seamless Wedding
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
        image={IMAGES.SERVICES.WEDDING_TRANSPORTATION.WHY_CHOOSE_US}
        imageAlt="Wedding car with chauffeur"
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
