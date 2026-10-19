import type { BookingOfferStatus } from "@prisma/client";

export type OfferSessionSnapshot = {
  bookingId: string;
  bookingNumber: string;
  status: string;
  vehicleCategoryId: string;
  fairPrice: number;
  pickupLat: number;
  pickupLng: number;
  expiresAt: string;
  userId: string;
  matchingRadius: number;
};

export type DriverCardCache = {
  driverId: string;
  firstName: string;
  lastName: string;
  rating: number;
  rides: number;
  vehicleMake: string;
  vehicleModel: string;
  licensePlate: string;
  avatarUrl: string | null;
};

export type OfferListItem = {
  id: string;
  bookingId: string;
  driverId: string;
  vehicleId: string;
  quotedPrice: number;
  fairPrice: number;
  fairPriceDelta: number;
  etaMinutes: number | null;
  distance: number | null;
  status: BookingOfferStatus;
  expiresAt: string;
  driver: DriverCardCache;
};

/** Nearby online drivers for customer map pins. */
export type NearbyDriverPin = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  rating: number;
  lat: number;
  lng: number;
  distance: number;
};

export type NearbyDriversResult = {
  bookingId: string;
  radius: number;
  pickup: { latitude: number; longitude: number } | null;
  drivers: NearbyDriverPin[];
};

export type MatchDispatchJob = {
  bookingId: string;
};

export type OfferExpireJob = {
  offerId: string;
};

export type SessionExpireJob = {
  bookingId: string;
};

export type PaymentTimeoutJob = {
  bookingId: string;
};

export type RadiusExpandJob = {
  bookingId: string;
  radius: number;
};

export type SupersedeFanoutJob = {
  bookingId: string;
  tripId: string;
  excludeDriverId: string;
};

export type CreateOfferData = {
  bookingId: string;
  driverId: string;
  vehicleId: string;
  quotedPrice: number;
  etaMinutes: number | null;
  distance: number | null;
  fairPriceDelta: number;
  expiresAt: Date;
};

export type SeekingStartedPayload = {
  bookingId: string;
  bookingNumber: string;
  userId: string;
  offerSessionExpiresAt: string;
};

export type OfferCreatedPayload = {
  offerId: string;
  bookingId: string;
  driverId: string;
  quotedPrice: number;
};

export type OfferAcceptedPayload = {
  offerId: string;
  bookingId: string;
  driverId: string;
  quotedPrice: number;
};

export type MarketplacePaidPayload = {
  bookingId: string;
  offerId: string;
  driverId: string;
  vehicleId: string;
  tripId: string;
};

export type LatLng = {
  lat: number;
  lng: number;
};

export type BookingPickupAddress = {
  pickup?: {
    latitude?: number;
    longitude?: number;
  };
};

export type BookingPricingSnapshot = {
  total?: number;
};

export type VehicleSummary = {
  make: string;
  model: string;
  licensePlate: string;
};

export type OfferDriverSnapshot = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  ratingAvg?: number;
  completedTrips?: number;
};

export type ResolveDriverCardOffer = {
  driverId: string;
  driver: OfferDriverSnapshot;
  vehicle: VehicleSummary;
};

export type BuildDriverCardInput = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  ratingAvg?: number | null;
  completedTrips?: number | null;
  vehicle: VehicleSummary | null;
};

export type StartSeekingResult = {
  offerSessionExpiresAt: Date;
  matchingRadius: number;
};

export type AcceptOfferResult = {
  bookingId: string;
  offerId: string;
  quotedPrice: number;
  paymentId: string;
  checkoutUrl: string;
  sessionId: string;
  paymentTimeoutMin: number;
};

export type ResumeCheckoutResult = {
  bookingId: string;
  offerId: string;
  quotedPrice: number;
  paymentId: string;
  checkoutUrl: string;
  sessionId: string;
  resumed: true;
};

export type PaymentReleaseMetric = "payment_failed_reopen" | "payment_timeout_reopen";
