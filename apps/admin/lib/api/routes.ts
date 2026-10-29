const API_ROUTES = {
  AUTH_CSRF: "/auth/csrf",
  AUTH_ME: "/auth/me",
  AUTH_LOGIN: "/auth/login",
  AUTH_REFRESH: "/auth/refresh",
  AUTH_LOGOUT: "/auth/logout",
  AUTH_LOGOUT_ALL: "/auth/logout-all",
  AUTH_CHANGE_PASSWORD: "/auth/change-password",
  AUTH_PROFILE: "/auth/profile",
  UPLOADS: "/uploads",

  VEHICLE_CATEGORIES: "/admin/vehicle-categories",
  VEHICLE_CATEGORY_PRICING: "/admin/vehicle-category-pricing",
  LUGGAGE: "/admin/luggage",
  BOOKINGS: "/admin/bookings",
  EXTRA_SERVICES: "/admin/extra-services",
  TICKETS: "/admin/tickets",
  CUSTOMERS: "/admin/customers",
  DRIVERS: "/admin/drivers",
  DASHBOARD: "/admin/dashboard",
  BLOGS: "/admin/blogs",
  BLOG_CATEGORIES: "/admin/blog-categories",
  BLOG_TAGS: "/admin/blog-tags",
  BLOG_COMMENTS: "/admin/blog-comments",
  PLATFORM_SETTINGS: "/admin/settings/platform",
  NOTIFICATIONS: "/notifications",
} as const;

export default API_ROUTES;
