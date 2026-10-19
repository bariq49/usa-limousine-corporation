export const WS_EVENTS = {
  AVAILABLE: "booking.available",
  TAKEN: "booking.taken",
} as const;

export const BOOKING_QUEUE_NAME = "booking";

export const BOOKING_JOB_NAMES = {
  EXPIRE_SWEEP: "BookingExpireSweep",
  MATCH_DISPATCH: "OfferMatchDispatch",
  OFFER_EXPIRE: "OfferExpire",
  SESSION_EXPIRE: "OfferSessionExpire",
  RADIUS_EXPAND: "OfferRadiusExpand",
  SUPERSEDE_FANOUT: "OfferSupersedeFanout",
  PAYMENT_TIMEOUT: "OfferPaymentTimeout",
} as const;

export const SWEEP_MS = 10_000;
export const LOCK_TTL_SECONDS = 24 * 60 * 60;
