import type { DriverRequestOutcome } from "@prisma/client";

export type RecordIncoming = {
  bookingId: string;
  driverIds: string[];
};

export type AttachTrip = {
  bookingId: string;
  driverId: string;
  tripId: string;
};

export type MarkNotAccepted = {
  bookingId: string;
  driverId?: string;
  excludeDriverId?: string;
};

export type MarkClientCancelled = {
  bookingId: string;
  excludeDriverId?: string;
};

export type MarkDriverTripOutcome = {
  bookingId: string;
  driverId: string;
  tripId: string;
};

export type MarkOutcome = {
  bookingId: string;
  driverId?: string;
  excludeDriverId?: string;
  outcome: DriverRequestOutcome;
  tripId?: string | null;
};

export type MarkDriverOutcome = {
  bookingId: string;
  driverId: string;
  outcome: DriverRequestOutcome;
  tripId?: string | null;
};
