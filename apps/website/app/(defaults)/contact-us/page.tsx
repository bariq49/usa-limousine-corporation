import PageBanner from "@/components/banner/page-banner";
import { IMAGES } from "@/constants/image-constants";
import ContactInfoCards from "@/components/contact/contact-info-cards";
import ContactFormSection from "@/components/contact/contact-form-section";
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
                variant="centered"
                image={IMAGES.CONTACT.BANNER}
                imageAlt="Contact Us Banner"
                title="Contact Us"
            />
            <ContactInfoCards />
            <ContactFormSection />
        </main>
    );
}
