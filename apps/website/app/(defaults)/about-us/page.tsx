import type { Metadata } from "next";
import { PLATFORM } from "@usa-limousine-corporation/config";
import PageBanner from "@/components/banner/page-banner";
import JourneySection from "@/components/about/journey-section";
import StatsBar from "@/components/shared/stats-bar";
import StorySection from "@/components/shared/story-section";
import { IMAGES } from "@/constants/image-constants";
import { CircleCheck, Clock, Star } from "@usa-limousine-corporation/ui/svg";

export const metadata: Metadata = {
  title: "About Us",
  description: `${PLATFORM.name}: ${PLATFORM.description}`,
};

export default function AboutUsPage() {
  return (
    <main className="min-h-screen">
      <PageBanner
        image={IMAGES.ABOUT.BANNER}
        imageAlt={`About ${PLATFORM.shortName}`}
        topText={`About ${PLATFORM.shortName}`}
        title="Driven by Passion.<br/>Defined by Excellence."
        description="For over a decade, we have been New Jersey and New York's trusted name in luxury ground transportation built on integrity, precision, and a genuine love for service."
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
        subtitle="Our Mission"
        title={
          <>
            More Than a Ride &ndash;
            <br />
            <span className="italic text-primary">A Commitment to You</span>
          </>
        }
        paragraphs={[
          `${PLATFORM.shortName} was founded with a simple belief: every journey deserves to feel exceptional. What began as a small fleet serving Newark Airport grew into the tri-state area's most trusted name in premium ground transportation.`,
          "We serve discerning travelers, corporate executives, and families who demand more than a ride. They demand an experience. From the moment you book to the moment you arrive, every detail is managed with care and precision. Our chauffeurs bring 30+ years of combined experience to every trip. They are licensed, vetted, and trained in the art of professional service because your safety and comfort are never compromised.",
        ]}
        image={IMAGES.ABOUT.MISSION}
        imageAlt="Luxury chauffeur vehicle at sunset"
      />
      <JourneySection
        subtitle="Our Journey"
        title={
          <>
            A Decade of
            <br />
            Distinguished Service
          </>
        }
        milestones={[
          {
            year: "2009",
            title: "Strengthening Regional Operations",
            description: `${PLATFORM.shortName} expanded service coverage across New Jersey and New York, enhancing airport transfer operations and executive transportation services with improved dispatch and customer support systems.`,
          },
          {
            year: "2012",
            title: "Enhanced Safety & Customer Experience",
            description:
              "Implemented elevated safety protocols, contactless booking options, and enhanced customer care services to provide secure and reliable transportation during changing travel demands.",
          },
          {
            year: "2015",
            title: "Fleet Expansion & Digital Booking",
            description:
              "Added Mercedes-Benz Sprinter vans and premium SUVs to the fleet. Launched our online booking platform featuring real-time flight tracking and instant booking confirmations.",
          },
          {
            year: "2018",
            title: "Corporate Accounts Growth",
            description:
              "Expanded dedicated corporate transportation programs with invoicing, priority reservations, and personalized account management, becoming a trusted transportation partner for businesses across the tri-state area.",
          },
          {
            year: "2021",
            title: "Luxury Fleet Modernization",
            description:
              "Introduced next-generation executive vehicles, luxury SUVs, and upgraded onboard amenities designed to provide premium comfort and business-class travel experiences.",
          },
          {
            year: "2023",
            title: "Advanced Technology Integration",
            description:
              "Upgraded dispatch systems with intelligent routing, enhanced airport monitoring, and streamlined reservation management for greater efficiency and customer convenience.",
          },
          {
            year: "2025",
            title: "Regional Market Leadership",
            description:
              "Expanded airport transportation coverage to serve 10+ major airports across New Jersey, New York, Long Island, and Connecticut while reaching thousands of satisfied travelers and corporate clients.",
          },
          {
            year: "2026",
            title: "Premier Tri-State Luxury Transportation",
            description:
              "Recognized as a leading luxury transportation provider operating 24/7 with an elite fleet of executive vehicles, premium customer service, and a continued commitment to excellence throughout the tri-state region.",
          },
        ]}
        image={IMAGES.ABOUT.JOURNEY}
        imageAlt="Chauffeur service with a luxury sedan"
      />
    </main>
  );
}
