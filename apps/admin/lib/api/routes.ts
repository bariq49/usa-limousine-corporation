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
  NOTIFICATIONS: "/notifications",
} as const;

export default API_ROUTES;
