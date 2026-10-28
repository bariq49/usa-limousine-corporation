"use strict";

const phoneE164 = "+17322898928";
const email = "info@usalimocorp.com";

const PLATFORM = Object.freeze({
  name: "USA Limousine Corporation",
  shortName: "USA Limousine",
  description:
    "Premier luxury transportation serving New Jersey, New York City, Long Island, and Connecticut with professional chauffeurs and an unwavering commitment to excellence.",
  contact: Object.freeze({
    email,
    emailHref: `mailto:${email}`,
    phone: "+1 732-289-8928",
    phoneE164,
    phoneHref: `tel:${phoneE164}`,
    whatsappHref: `https://wa.me/${phoneE164.replace("+", "")}`,
    address: Object.freeze({
      city: "Sayreville",
      region: "NJ",
      postalCode: "08872",
      country: "US",
      display: "Sayreville, NJ 08872",
    }),
    operatingHours: "24 / 7 / 365",
    availability: "24/7 — All Days",
  }),
  social: Object.freeze({
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    tiktok: "https://www.tiktok.com",
    linkedin: "https://www.linkedin.com",
    pinterest: "https://www.pinterest.com",
    x: "https://x.com",
    youtube: "https://www.youtube.com",
  }),
  locale: Object.freeze({
    timezone: "America/New_York",
    locale: "en-US",
    currency: "USD",
    currencySymbol: "$",
    distanceUnit: "mile",
    distanceUnitShort: "mi",
  }),
});

module.exports = { PLATFORM };
