import type { TripType } from "../types/booking";

export const TRIP_TYPES = {
  ONE_WAY: "one-way",
  RETURN: "return",
  HOURLY: "hourly",
} as const satisfies Record<string, TripType>;

export const PASSENGER_TITLES = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Ms.", label: "Ms." },
  { value: "Dr.", label: "Dr." },
];

export const MAX_VEHICLES = 10;

export const PICKUP_TIME_ERRORS = ["PICKUP_PASSED", "PICKUP_TOO_SOON"];

export const BOOKING_API_ROUTES = {
  VEHICLE_CATEGORIES: `/public/vehicle-categories`,
  HOURLY_DURATIONS: `/public/vehicle-categories/hourly-durations`,
  ESTIMATES: `/public/estimates`,
  EXTRA_SERVICES: `/public/extra-services`,
  SETTINGS: `/public/settings`,
  CHECKOUT: `/public/bookings/checkout`,
} as const;
