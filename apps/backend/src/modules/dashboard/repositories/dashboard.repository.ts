import { Inject, Injectable } from "@nestjs/common";
import { DriverStatus } from "@prisma/client";
import { wallClock } from "../../../common/utils/day-bounds";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type {
  AssignmentDayRow,
  AssignmentEventRow,
  BookingDayRow,
  BookingEventRow,
  CustomerEventRow,
} from "../types/dashboard";

@Injectable()
export class DashboardRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  bookingRows(start: string, end: string): Promise<BookingDayRow[]> {
    const from = wallClock(APP_TIMEZONE, start, "00:00") ?? new Date(`${start}T00:00:00Z`);
    const to = wallClock(APP_TIMEZONE, end, "00:00") ?? new Date(`${end}T00:00:00Z`);

    return this.prisma.$queryRaw<BookingDayRow[]>`
      SELECT
        to_char(("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${APP_TIMEZONE})::date, 'YYYY-MM-DD') AS day,
        "status" AS status,
        COUNT(*)::int AS count,
        COALESCE(SUM("totalPrice"), 0)::float8 AS amount
      FROM "Booking"
      WHERE "deletedAt" IS NULL
        AND "createdAt" >= ${from}
        AND "createdAt" < ${to}
      GROUP BY 1, 2
    `;
  }

  assignmentRows(start: string, end: string): Promise<AssignmentDayRow[]> {
    return this.prisma.$queryRaw<AssignmentDayRow[]>`
      SELECT
        b."bookingTime"->>'pickupDate' AS day,
        COUNT(*)::int AS rides,
        COALESCE(SUM(b."totalPrice"), 0)::float8 AS "rideTotal",
        COALESCE(SUM(a."commissionAmount"), 0)::float8 AS commission,
        COALESCE(SUM(a."driverAmount"), 0)::float8 AS "driverPayout"
      FROM "BookingAssignment" a
      JOIN "Booking" b ON b."id" = a."bookingId"
      WHERE a."status" = 'ACTIVE'
        AND b."deletedAt" IS NULL
        AND b."status" IN ('CONFIRMED', 'COMPLETED')
        AND b."bookingTime"->>'pickupDate' >= ${start}
        AND b."bookingTime"->>'pickupDate' < ${end}
      GROUP BY 1
    `;
  }

  bookingEvents(start: Date, end: Date): Promise<BookingEventRow[]> {
    return this.prisma.$queryRaw<BookingEventRow[]>`
      SELECT
        b."createdAt" AS "createdAt",
        b."status" AS status,
        COALESCE(b."totalPrice", 0)::float8 AS amount,
        (b."status" = 'PENDING' AND p."id" IS NULL)::boolean AS unpaid,
        (b."status" = 'COMPLETED')::boolean AS "bookingCompleted"
      FROM "Booking" b
      LEFT JOIN "Payment" p ON p."bookingId" = b."id" AND p."status" = 'PAID'
      WHERE b."deletedAt" IS NULL
        AND b."createdAt" >= ${start}
        AND b."createdAt" < ${end}
    `;
  }

  assignmentEvents(start: Date, end: Date): Promise<AssignmentEventRow[]> {
    const startDay = start.toISOString().slice(0, 10);
    const endDay = end.toISOString().slice(0, 10);
    return this.prisma.$queryRaw<AssignmentEventRow[]>`
      SELECT
        ((b."bookingTime"->>'pickupDate') || 'T12:00:00Z')::timestamptz AS "pickupAt",
        1::int AS rides,
        COALESCE(b."totalPrice", 0)::float8 AS "rideTotal",
        COALESCE(a."commissionAmount", 0)::float8 AS commission,
        COALESCE(a."driverAmount", 0)::float8 AS "driverPayout",
        (b."status" = 'COMPLETED')::boolean AS completed
      FROM "BookingAssignment" a
      JOIN "Booking" b ON b."id" = a."bookingId"
      WHERE a."status" = 'ACTIVE'
        AND b."deletedAt" IS NULL
        AND b."status" IN ('CONFIRMED', 'COMPLETED')
        AND b."bookingTime"->>'pickupDate' >= ${startDay}
        AND b."bookingTime"->>'pickupDate' < ${endDay}
    `;
  }

  customerEvents(start: Date, end: Date): Promise<CustomerEventRow[]> {
    return this.prisma.$queryRaw<CustomerEventRow[]>`
      SELECT
        "createdAt" AS "createdAt",
        "type" AS type
      FROM "Customer"
      WHERE "deletedAt" IS NULL
        AND "createdAt" >= ${start}
        AND "createdAt" < ${end}
    `;
  }

  countCustomersByType() {
    return this.prisma.customer.groupBy({
      by: ["type"],
      where: { deletedAt: null },
      _count: { _all: true },
    });
  }

  countActiveCustomers(start: Date, end: Date) {
    return this.prisma.booking
      .groupBy({
        by: ["userId"],
        where: {
          deletedAt: null,
          createdAt: { gte: start, lt: end },
        },
      })
      .then((rows) => rows.length);
  }

  countActiveDrivers() {
    return this.prisma.driver.count({ where: { deletedAt: null, status: DriverStatus.ACTIVE } });
  }

  countDrivers() {
    return this.prisma.driver.count({ where: { deletedAt: null } });
  }

  countCustomers() {
    return this.prisma.customer.count({ where: { deletedAt: null } });
  }
}
