export const OFFER_EVENT = {
  SEEKING_STARTED: "booking.seeking_started",
  CREATED: "offer.created",
  ACCEPTED: "offer.accepted",
  DECLINED: "offer.declined",
  EXPIRED: "offer.expired",
  WITHDRAWN: "offer.withdrawn",
  SESSION_EXPIRED: "booking.offer_session_expired",
  MARKETPLACE_PAID: "booking.marketplace_paid",
  PRICE_COUNTERED: "booking.price_countered",
} as const;

export type OfferEventName = (typeof OFFER_EVENT)[keyof typeof OFFER_EVENT];
