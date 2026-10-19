import type { DriverCardCache, OfferSessionSnapshot } from "./offer";

export type PutSession = OfferSessionSnapshot & {
  ttlSeconds: number;
};

export type BookingRef = {
  bookingId: string;
};

export type TrackDrivers = {
  bookingId: string;
  driverIds: string[];
  ttlSeconds: number;
};

export type AddOffer = {
  bookingId: string;
  offerId: string;
  quotedPrice: number;
  ttlSeconds: number;
};

export type OfferRef = {
  bookingId: string;
  offerId: string;
};

export type PutCard = {
  card: DriverCardCache;
};

export type DriverRef = {
  driverId: string;
};

export type ClaimIdem = {
  actor: string;
  key: string;
  ttlSeconds: number;
};
