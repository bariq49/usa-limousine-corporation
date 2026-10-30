import AirportsSection from "@/components/home/airports-section";
import CtaSection from "@/components/home/cta-section";
import HeroSection from "@/components/home/hero-section";
import PartnerSection from "@/components/home/partner-section";
import ServicesSection from "@/components/home/services-section";
import StatsBar from "@/components/shared/stats-bar";
import StorySection from "@/components/shared/story-section";
import TrustSection from "@/components/home/trust-section";
import WhyChooseUsSection from "@/components/shared/why-choose-us-section";
import { PLATFORM } from "@usa-limousine-corporation/config";
import { IMAGES } from "@/constants/image-constants";
import {
  CircleCheck,
  Clock,
  Location,
  ShieldCheckOutline,
  Star,
  User,
} from "@usa-limousine-corporation/ui/svg";

export default function Home() {
  return (
    <>
      <HeroSection />
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
        subtitle="About Us"
        title={
          <>
            We&apos;re Here to Make
            <br />
            Every Journey
          </>
        }
        paragraphs={[
          "USA Limousine is a premier luxury transportation service providing reliable, professional, and comfortable rides throughout the tri-state area.",
          "We specialize in airport transportation to and from Newark Liberty, JFK, LaGuardia, Teterboro, Morristown, Philadelphia, and surrounding regional airports. With professional chauffeurs, real-time flight monitoring, and a commitment to exceptional customer service, we provide a luxury experience tailored to every client.",
        ]}
        image={IMAGES.HOME.STORY}
        imageAlt="USA Limousine luxury chauffeur transportation"
      />
      <TrustSection
        title="Trusted, everywhere you go"
        metrics={[
          {
            value: 50,
            suffix: "+",
            label: "bookings per day",
          },
          {
            value: 70,
            suffix: "%",
            label: "customer retention",
          },
          {
            value: 4.9,
            decimals: 1,
            suffix: "/5",
            label: "customer satisfaction",
          },
        ]}
        backgroundImage={IMAGES.HOME.STATS_BG}
      />
      <PartnerSection
        title="We are trusted by"
        partners={[
          {
            name: "Carpoint Auto Group",
            logo: IMAGES.HOME.PARTNERS.CARPOINT,
          },
          {
            name: "Penske Automotive",
            logo: IMAGES.HOME.PARTNERS.PENSKE,
          },
          {
            name: "Guardian",
            logo: IMAGES.HOME.PARTNERS.GUARDIAN,
          },
          {
            name: "Visionet",
            logo: IMAGES.HOME.PARTNERS.VISIONET,
          },
          {
            name: "Hertz",
            logo: IMAGES.HOME.PARTNERS.HERTZ,
          },
        ]}
      />
      <AirportsSection
        badge="AIRPORTS"
        title="Top Premier Airport We serve"
        subtitle="Delivering luxury chauffeur and VIP airport transfer services across New York, New Jersey, and Pennsylvania."
        airports={[
          {
            name: "Newark Liberty Airport",
            image: IMAGES.HOME.AIRPORTS.NEWARK,
          },
          {
            name: "John F. Kennedy Airport",
            image: IMAGES.HOME.AIRPORTS.JFK,
          },
          {
            name: "LaGuardia Airport",
            image: IMAGES.HOME.AIRPORTS.LAGUARDIA,
          },
          {
            name: "Teterboro Airport",
            image: IMAGES.HOME.AIRPORTS.TETERBORO,
          },
          {
            name: "Westchester County Airport",
            image: IMAGES.HOME.AIRPORTS.WESTCHESTER,
          },
        ]}
      />
      <WhyChooseUsSection
        badge="WHY CHOOSE US"
        title="Luxury · Reliability · Professionalism"
        subtitle="Everything you need for a world-class transportation experience"
        features={[
          {
            icon: <User className="h-5 w-5" />,
            title: "Professional Chauffeurs",
            description:
              "30+ years combined experience with background-checked, licensed professionals",
          },
          {
            icon: <Clock className="h-5 w-5" />,
            title: "24/7 Availability",
            description:
              "Round-the-clock service every day of the year - early mornings and late nights included",
          },
          {
            icon: <Location className="h-5 w-5" />,
            title: "Real-Time Flight Tracking",
            description:
              "We monitor your flight and adjust pickup times automatically - no calls needed",
          },
          {
            icon: <ShieldCheckOutline className="h-5 w-5" />,
            title: "Safe & Comfortable",
            description:
              "Fully insured, regularly inspected vehicles - your safety is always our top priority.",
          },
        ]}
      />
      <ServicesSection
        badge="OUR SERVICES"
        title="Flexible, Professional, And Reliable."
        subtitle="We offer car rental solutions flexible to your schedule, affordable for any budget, and reliable when you need them most. From airports to boardrooms, we've got you covered."
        image={IMAGES.HOME.SERVICES_SHOWCASE}
        imageAlt="USA Limousine chauffeur greeting luxury clients"
        services={[
          {
            title: "Airport Transfers",
            description:
              "Reliable airport transportation with on time pickups and professional chauffeurs serving all major airports across New Jersey, New York, and surrounding areas. Real-time flight monitoring included.",
          },
          {
            title: "Hourly Chauffeur Services",
            description:
              "Book a private chauffeur by the hour for meetings, events, city travel, shopping, or flexible transportation needs. Your schedule, your way.",
          },
          {
            title: "Corporate Transportation",
            description:
              "Executive transportation solutions for businesses, corporate clients, executives, and VIP guests. Invoicing options available for seamless business travel management.",
          },
          {
            title: "Point-to-Point Transfers",
            description:
              "Luxury transportation between any two destinations with fixed pricing and professional service. No surprises - just seamless, comfortable travel from door to door.",
          },
          {
            title: "Wedding Transportation",
            description:
              "Elegant, reliable transportation for your special day with professional chauffeurs, luxury vehicles, and seamless service for weddings, receptions, and bridal parties.",
          },
          {
            title: "Prom Transportation",
            description:
              "Make prom night unforgettable with safe, stylish transportation, professional chauffeurs, and luxury vehicles for groups, couples, and special celebrations.",
          },
        ]}
      />
      <CtaSection
        badge="EXPERIENCE THE DIFFERENCE"
        title={
          <>
            Luxury Transportation
            <br />
            You Can Trust
          </>
        }
        subtitle="Professional Chauffeurs · Luxury Vehicles · 24/7 Availability"
        features={[
          "PROFESSIONAL CHAUFFEURS",
          "EXECUTIVE FLEET",
          "ON-TIME GUARANTEE",
          "24/7 SUPPORT",
        ]}
        backgroundImage={IMAGES.HOME.CTA_BANNER}
        primaryButton={{
          label: "RESERVE YOUR RIDE TODAY",
          href: "/#hero-booking",
        }}
        secondaryButton={{
          label: "CALL US NOW",
          href: PLATFORM.contact.phoneHref,
        }}
      />
    </>
  );
}
