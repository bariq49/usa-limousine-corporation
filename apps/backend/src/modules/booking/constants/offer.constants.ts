export const OFFER_WS_EVENTS = {
  REQUEST: "offer.request",
  CREATED: "offer.created",
  UPDATED: "offer.updated",
  RESULT: "offer.result",
  SESSION_EXPIRED: "offer.session_expired",
} as const;

export const OFFER_QUEUE_JOBS = {
  MATCH_DISPATCH: "OfferMatchDispatch",
  OFFER_EXPIRE: "OfferExpire",
  SESSION_EXPIRE: "OfferSessionExpire",
  RADIUS_EXPAND: "OfferRadiusExpand",
  SUPERSEDE_FANOUT: "OfferSupersedeFanout",
} as const;

/** Redis accept lock TTL seconds (infra — not admin-tunable). */
export const ACCEPT_LOCK_TTL_SECONDS = 30;
/** Driver card cache TTL seconds (infra — not admin-tunable). */
export const DRIVER_CARD_TTL_SECONDS = 180;

export const OFFER_REDIS = {
  session: (bookingId: string) => `offer:session:${bookingId}`,
  list: (bookingId: string) => `offer:list:${bookingId}`,
  drivers: (bookingId: string) => `offer:drivers:${bookingId}`,
  accept: (bookingId: string) => `offer:accept:${bookingId}`,
  card: (driverId: string) => `driver:card:${driverId}`,
  idem: (actor: string, key: string) => `idem:${actor}:${key}`,
  rate: (bucket: string, key: string) => `offer:rl:${bucket}:${key}`,
  metrics: (name: string) => `offer:metrics:${name}`,
  busy: "drivers:busy",
  geoCategory: (categoryId: string) => `drivers:geo:${categoryId}`,
} as const;

/** Sliding-window rate limits (infra / abuse — not admin-tunable). */
export const OFFER_RATE_LIMITS = {
  seekPerIp: 20,
  quotePerDriver: 30,
  acceptPerToken: 20,
  listPerToken: 60,
  windowSeconds: 60,
} as const;
