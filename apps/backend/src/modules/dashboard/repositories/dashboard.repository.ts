import { Inject, Injectable } from "@nestjs/common";
import { DriverStatus } from "@prisma/client";
import { wallClock } from "../../../common/utils/day-bounds";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { AssignmentDayRow, BookingDayRow } from "../types/dashboard";

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

  countActiveDrivers() {
    return this.prisma.driver.count({ where: { deletedAt: null, status: DriverStatus.ACTIVE } });
  }
}
