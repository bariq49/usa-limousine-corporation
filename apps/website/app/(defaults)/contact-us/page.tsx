import PageBanner from "@/components/banner/page-banner";
import { IMAGES } from "@/constants/image-constants";
import ContactInfoCards from "@/components/contact/contact-info-cards";
import ContactFormSection from "@/components/contact/contact-form-section";
import FaqSection from "@/components/shared/faq-section";
import StatsBar from "@/components/shared/stats-bar";
import { CircleCheck, Clock, Star } from "@usa-limousine-corporation/ui/svg";
import { Metadata } from "next";
import { PLATFORM } from "@usa-limousine-corporation/config";

export const metadata: Metadata = {
    title: `Contact Us | ${PLATFORM.shortName}`,
    description: `Get in touch with ${PLATFORM.shortName} for airport transfers, chauffeur bookings and executive travel across New Jersey, New York and Connecticut.`,
    keywords: `Contact ${PLATFORM.shortName}, limo service New Jersey, chauffeur inquiry ${PLATFORM.contact.address.city} ${PLATFORM.contact.address.region}`,
};

export default function ContactPage() {
    return (
        <main className="min-h-screen">
            <PageBanner
                image={IMAGES.CONTACT.BANNER}
                imageAlt={`Contact ${PLATFORM.shortName}`}
                topText="Get in Touch"
                title="We are Here,<br/>Around the Clock"
                description="Whether you are booking a last-minute ride, setting up a corporate account, or have a question about our services, our team is always ready to assist."
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
            <ContactInfoCards />
            <ContactFormSection />
            <FaqSection
                subtitle="Frequently Asked"
                title="Common Questions"
                description="Everything you need to know before booking. Can't find your answer? Call us — we're available 24/7."
                items={[
                    {
                        question: "How far in advance should I book?",
                        answer: "We recommend booking at least 24 hours in advance for the best vehicle selection. However, we can often accommodate same-day requests — call us for immediate availability.",
                    },
                    {
                        question: "Do you track flights for airport pickups?",
                        answer: "Yes. Our dispatch team monitors all flights in real-time. If your flight is delayed or arrives early, your driver adjusts accordingly at no extra charge.",
                    },
                    {
                        question: "What airports do you serve?",
                        answer: "We serve all major New York, New Jersey, and Philadelphia airports, including JFK, EWR, LGA, TEB, HPN, and PHL.",
                    },
                    {
                        question: "Is gratuity included in the price?",
                        answer: "Yes, all rides include gratuity in the price.",
                    },
                    {
                        question: "What is your cancellation policy?",
                        answer: "Cancellations made 4+ hours before pickup are fully refunded. Cancellations within 4 hours may incur a fee. No-shows are charged at the full rate.",
                    },
                    {
                        question: "Are your chauffeurs licensed and background-checked?",
                        answer: "Absolutely. All chauffeurs hold valid commercial driver's licenses, undergo rigorous background checks, and complete our in-house professional training program.",
                    },
                    {
                        question: "Do you provide child safety seats?",
                        answer: "Yes. Child safety seats are included at additional charge per seat.",
                    },
                    {
                        question: "What payment methods do you accept?",
                        answer: "We accept all major credit cards (Visa, MasterCard, Amex), digital wallets (Apple Pay, Google Pay), and corporate billing accounts.",
                    },
                ]}
            />
        </main>
    );
}
