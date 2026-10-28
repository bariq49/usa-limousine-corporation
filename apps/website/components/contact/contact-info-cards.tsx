"use client";

import React from "react";
import { Clock, Mail, Phone } from "@usa-limousine-corporation/ui/svg";
import Link from "next/link";
import { PLATFORM } from "@usa-limousine-corporation/config";

export default function ContactInfoCards() {
    const CONTACT_CARDS = [
        {
            icon: Phone,
            title: "Phone & WhatsApp",
            description: "Speak directly with our concierge team",
            value: PLATFORM.contact.phone,
            href: PLATFORM.contact.phoneHref,
        },
        {
            icon: Mail,
            title: "Email",
            description: "General inquiries & corporate quotes",
            value: PLATFORM.contact.email,
            href: PLATFORM.contact.emailHref,
        },
        {
            icon: Clock,
            title: "Operating Hours",
            description: "Round-the-clock availability",
            value: PLATFORM.contact.operatingHours,
        },
    ];

    return (
        <section className="py-16 relative z-30">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                    {CONTACT_CARDS.map((card, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50/80 px-6 py-10 text-center md:px-8"
                        >
                            <card.icon className="mb-5 h-9 w-9 text-secondary" strokeWidth={1.5} />
                            <h3 className="mb-2 text-lg font-bold text-gray-900">{card.title}</h3>
                            <p className="mb-5 text-sm text-gray-500">{card.description}</p>
                            {card.href ? (
                                <Link
                                    href={card.href}
                                    className="text-base font-bold text-secondary transition-colors hover:text-secondary/80"
                                >
                                    {card.value}
                                </Link>
                            ) : (
                                <p className="text-base font-bold text-secondary">{card.value}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
