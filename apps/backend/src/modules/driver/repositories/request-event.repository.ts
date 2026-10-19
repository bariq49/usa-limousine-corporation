import { Inject, Injectable } from "@nestjs/common";
import { DriverRequestOutcome } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type {
  AttachTrip,
  MarkDriverOutcome,
  MarkOutcome,
  RecordIncoming,
} from "../types/request-event";

@Injectable()
export class DriverRequestEventRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async recordIncoming(params: RecordIncoming): Promise<void> {
    const driverIds = Array.from(new Set(params.driverIds.filter(Boolean)));
    if (driverIds.length === 0) {
      return;
    }

    await this.prisma.driverRequestEvent.createMany({
      data: driverIds.map((driverId) => ({
        driverId,
        bookingId: params.bookingId,
        outcome: DriverRequestOutcome.PENDING,
      })),
      skipDuplicates: true,
    });
  }

  async attachTrip(params: AttachTrip): Promise<void> {
    await this.prisma.driverRequestEvent.upsert({
      where: {
        driverId_bookingId: {
          driverId: params.driverId,
          bookingId: params.bookingId,
        },
      },
      create: {
        driverId: params.driverId,
        bookingId: params.bookingId,
        tripId: params.tripId,
        outcome: DriverRequestOutcome.PENDING,
      },
      update: {
        tripId: params.tripId,
      },
    });
  }

  async markOutcome(params: MarkOutcome): Promise<number> {
    const now = new Date();
    const where: Prisma.DriverRequestEventWhereInput = {
      bookingId: params.bookingId,
      outcome: DriverRequestOutcome.PENDING,
    };

    if (params.driverId !== undefined) {
      where.driverId = params.driverId;
    }
    if (params.excludeDriverId !== undefined) {
      where.driverId = { not: params.excludeDriverId };
    }

    const data: Prisma.DriverRequestEventUncheckedUpdateManyInput = {
      outcome: params.outcome,
      outcomeAt: now,
    };
    if (params.tripId !== undefined) {
      data.tripId = params.tripId;
    }

    const result = await this.prisma.driverRequestEvent.updateMany({
      where,
      data,
    });
    return result.count;
  }

  async markDriverOutcome(params: MarkDriverOutcome): Promise<void> {
    const now = new Date();
    const tripId = params.tripId === undefined ? null : params.tripId;
    const update: Prisma.DriverRequestEventUncheckedUpdateInput = {
      outcome: params.outcome,
      outcomeAt: now,
    };
    if (params.tripId !== undefined) {
      update.tripId = params.tripId;
    }

    await this.prisma.driverRequestEvent.upsert({
      where: {
        driverId_bookingId: {
          driverId: params.driverId,
          bookingId: params.bookingId,
        },
      },
      create: {
        driverId: params.driverId,
        bookingId: params.bookingId,
        tripId,
        outcome: params.outcome,
        outcomeAt: now,
      },
      update,
    });
  }

  listForDriver(params: { driverId: string; start: Date; end: Date }) {
    return this.prisma.driverRequestEvent.findMany({
      where: {
        driverId: params.driverId,
        createdAt: { gte: params.start, lt: params.end },
      },
      select: {
        outcome: true,
        createdAt: true,
        outcomeAt: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }
}
