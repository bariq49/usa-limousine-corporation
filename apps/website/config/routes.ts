export const API_ROUTES = {
    VEHICLE_CATEGORIES: `/public/vehicle-categories`,
    HOURLY_DURATIONS: `/public/vehicle-categories/hourly-durations`,
    ESTIMATES: `/public/estimates`,
    EXTRA_SERVICES: `/public/extra-services`,
    SETTINGS: `/public/settings`,
    CHECKOUT: `/public/bookings/checkout`,
    CONTACT: `/public/contact`,
    BLOGS: `/public/blogs`,
    BLOG_CATEGORIES: `/public/blog-categories`,
} as const;

export default API_ROUTES;
