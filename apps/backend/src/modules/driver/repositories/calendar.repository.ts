import { Injectable } from "@nestjs/common";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { APIFeature } from "../../../common/api-feature/api-feature";
import { CalendarOwnerType } from "@prisma/client";
import type { CalendarQueryDto } from "../dto/calendar.dto";

@Injectable()
export class DriverCalendarRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findEvents(driverId: string, query: CalendarQueryDto) {
    const feature = new APIFeature(query, {
      initialFilter: {
        ownerType: CalendarOwnerType.DRIVER,
        ownerId: driverId,
        deletedAt: null,
      },
      sort: {
        defaultSortBy: "startAt",
        defaultSortOrder: "asc",
      },
      dateRange: {
        field: "startAt",
      },
    });

    const paginatedEvents = await feature.execute({
      findMany: (args) =>
        this.prisma.calendarEvent.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
        }),
      count: ({ where }) => this.prisma.calendarEvent.count({ where: where as never }),
    });

    const bookingIds = paginatedEvents.data
      .map((event) => event.bookingId)
      .filter((id): id is string => id !== null);

    const bookings = await this.prisma.booking.findMany({
      where: { id: { in: bookingIds } },
      include: {
        vehicleCategory: true,
        trip: true,
      },
    });

    const bookingsMap = new Map(bookings.map((b) => [b.id, b]));

    const enrichedData = paginatedEvents.data.map((event) => {
      const booking = event.bookingId ? bookingsMap.get(event.bookingId) : null;
      return Object.assign(event, {
        booking: booking || null,
      });
    });

    return Object.assign(paginatedEvents, {
      data: enrichedData,
    });
  }
}
