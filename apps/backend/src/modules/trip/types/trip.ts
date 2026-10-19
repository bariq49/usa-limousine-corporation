import type { Prisma, TripStatus } from "@prisma/client";
import type { ListQueryDto, QueryDto } from "../dto/trip.dto";

export type CreateData = {
  bookingId: string;
  driverId: string;
  vehicleId: string;
};

export type UpdateStatusData = {
  status: TripStatus;
  actorUserId: string;
  cancellationReason?: string;
  startedAt?: Date;
  arrivedAtPickupAt?: Date;
  pickedUpAt?: Date;
  droppedOffAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
};

export type TripUpdate = {
  status: TripStatus;
  startedAt?: Date;
  arrivedAtPickupAt?: Date;
  pickedUpAt?: Date;
  droppedOffAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
};

export type ReviewData = {
  tripId: string;
  driverId: string;
  bookingId: string;
  rating: number;
  comment?: string | undefined;
  passenger: Prisma.InputJsonValue | null;
};

export type DriverReviewData = {
  tripId: string;
  driverId: string;
  bookingId: string;
  customerId: string;
  rating: number;
  comment?: string | undefined;
};

export type ApplyDriverRating = {
  driverId: string;
  rating: number;
};

export type BookingTimeData = {
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
};

export type PickupDateFilter = {
  equals?: string;
  lte?: string;
  gt?: string;
  fromNow?: {
    date: string;
    time: string;
  };
};

export type FindManyParams = {
  query: QueryDto | ListQueryDto;
  driverId?: string;
  userId?: string;
  statuses?: TripStatus[];
  pickupDate?: PickupDateFilter;
};

export type ActiveForDriver = {
  driverId: string;
  excludeId?: string;
  statuses?: TripStatus[];
};
