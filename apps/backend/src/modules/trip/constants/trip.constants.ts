import { TripStatus } from "@prisma/client";

export const ACTIVE_TRIP_STATUSES: TripStatus[] = [
  TripStatus.ACCEPTED,
  TripStatus.STARTED,
  TripStatus.ARRIVED_AT_PICKUP,
  TripStatus.PASSENGER_ON_BOARD,
  TripStatus.EN_ROUTE_TO_DROPOFF,
  TripStatus.ARRIVED_AT_DROPOFF,
];

export const IN_PROGRESS = ACTIVE_TRIP_STATUSES.filter((status) => status !== TripStatus.ACCEPTED);

export const BUFFER_MIN = 15;

export const TRIP_WS_EVENTS = {
  LOCATION: "driver.location",
  CALL: "trip.call",
} as const;

export const TRIP_LOCATION = {
  REDIS_TTL_SECONDS: 60,
  MIN_INTERVAL_MS: 2500,
  MAX_AGE_MS: 30_000,
  MAX_ACCURACY: 100,
  HISTORY_BATCH_SIZE: 25,
} as const;

export function tripLocationKey(tripId: string): string {
  return `trip:${tripId}:location`;
}

export function driverLocationKey(driverId: string): string {
  return `driver:${driverId}:location`;
}

export function locationRateKey(driverId: string): string {
  return `trip:location:rate:${driverId}`;
}

export function tripLocationBufferKey(tripId: string): string {
  return `trip:${tripId}:location:buf`;
}
