export const API_ROUTES = {
    VEHICLE_CATEGORIES: `/public/vehicle-categories`,
    HOURLY_DURATIONS: `/public/vehicle-categories/hourly-durations`,
    QUOTES: `/public/quotes`,
    QUOTE_ESTIMATES: `/public/quotes/estimates`,
    LUGGAGE: `/public/luggage`,
    EXTRA_SERVICES: `/public/extra-services`,
    SETTINGS: `/public/settings`,
    CHECKOUT: `/public/bookings/checkout`,
    BLOGS: `/public/blogs`,
    BLOG_CATEGORIES: `/public/blog-categories`,
} as const;

export default API_ROUTES;
