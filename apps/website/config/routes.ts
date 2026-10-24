export const API_ROUTES = {
    VEHICLE_CATEGORIES: `/public/vehicle-categories`,
    VEHICLE_PRICING: `/public/vehicle-categories/pricing`,
    LUGGAGE: `/public/luggage`,
    EXTRA_SERVICES: `/public/extra-services`,
    SETTINGS: `/public/settings`,
    CHECKOUT: `/public/bookings/checkout`,
} as const;

// Public site routes
export const SITE_ROUTES = {
    HOME: `/`,
    CONTACT: `/contact-us`,
} as const;

export default API_ROUTES;
