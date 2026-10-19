import type {
  BookingType,
  CalendarEventStatus,
  CalendarEventType,
  CalendarOwnerType,
  Prisma,
} from "@prisma/client";

export type CreateData = {
  ownerType: CalendarOwnerType;
  ownerId: string;
  bookingId?: string | undefined;
  bookingType?: BookingType | undefined;
  type: CalendarEventType;
  title: string;
  description?: string | undefined;
  startAt: Date;
  endAt: Date;
  timezone?: string | undefined;
  metadata?: Prisma.InputJsonValue | undefined;
};

export type UpdateData = {
  status?: CalendarEventStatus | undefined;
  title?: string | undefined;
  description?: string | undefined;
  startAt?: Date | undefined;
  endAt?: Date | undefined;
  metadata?: Prisma.InputJsonValue | undefined;
  deletedAt?: Date | null | undefined;
};
