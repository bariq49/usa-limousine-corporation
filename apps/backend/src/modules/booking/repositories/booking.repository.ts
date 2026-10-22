import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { type BookingStatus, Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { wallClock } from "../../../common/utils/day-bounds";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { QueryDto } from "../dto/booking.dto";
import type {
  AnalyticsRow,
  CreateData,
  ExtraServiceItemInput,
  LuggageItemInput,
  PricedItems,
  StatusUpdate,
  UpdateData,
  UpdateStatusData,
} from "../types/booking";

/** Line items with names; `unitPrice` is the price charged, not today's catalog price. */
const itemsInclude = {
  luggage: {
    include: { luggageType: { select: { id: true, name: true } } },
  },
  extraServices: {
    include: { extraService: { select: { id: true, name: true, type: true } } },
  },
} as const;

@Injectable()
export class BookingRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  /** All bookings, or only one customer's when `userId` is given. */
  findMany(query: QueryDto, userId?: string) {
    const initialFilter: Prisma.BookingWhereInput = { deletedAt: null };
    if (userId) {
      initialFilter.userId = userId;
    }

    const feature = new APIFeature(query, {
      initialFilter,
      // Customers are pinned to their own userId; only admins may filter by it.
      filterFields: userId ? ["status", "bookingType"] : ["status", "bookingType", "userId"],
      excludeQueryKeys: userId ? ["userId"] : [],
      search: {
        searchFields: ["bookingNumber"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "bookingNumber", "status"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.booking.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: {
            vehicleCategory: {
              select: {
                id: true,
                name: true,
                image: true,
                passengerCount: true,
              },
            },
          },
        }),
      count: ({ where }) => this.prisma.booking.count({ where: where as never }),
    });
  }

  findById(id: string) {
    return this.prisma.booking.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        vehicleCategory: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            passengerCount: true,
          },
        },
        luggage: itemsInclude.luggage,
        extraServices: itemsInclude.extraServices,
      },
    });
  }

  /**
   * Looks up active catalog items and captures their current price.
   * Unknown or inactive items are rejected so a booking never references a hidden product.
   */
  async priceItems(
    extraServices: ExtraServiceItemInput[],
    luggage: LuggageItemInput[],
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<PricedItems> {
    const [services, luggageTypes] = await Promise.all([
      client.extraService.findMany({
        where: {
          id: { in: extraServices.map((item) => item.extraServiceId) },
          isActive: true,
          deletedAt: null,
        },
        select: { id: true, price: true },
      }),
      client.luggageType.findMany({
        where: { id: { in: luggage.map((item) => item.luggageTypeId) }, isActive: true },
        select: { id: true, price: true },
      }),
    ]);

    const servicePrice = new Map(services.map((row) => [row.id, row.price]));
    const luggagePrice = new Map(luggageTypes.map((row) => [row.id, row.price]));

    const unknownServices = extraServices.filter((item) => !servicePrice.has(item.extraServiceId));
    const unknownLuggage = luggage.filter((item) => !luggagePrice.has(item.luggageTypeId));
    if (unknownServices.length > 0 || unknownLuggage.length > 0) {
      throw new BadRequestException(
        `Unknown or inactive items: ${unknownServices
          .map((item) => item.extraServiceId)
          .concat(unknownLuggage.map((item) => item.luggageTypeId))
          .join(", ")}`,
      );
    }

    return {
      extraServices: extraServices.map((item) => ({
        extraServiceId: item.extraServiceId,
        quantity: item.quantity,
        unitPrice: servicePrice.get(item.extraServiceId) as Prisma.Decimal,
      })),
      luggage: luggage.map((item) => ({
        luggageTypeId: item.luggageTypeId,
        quantity: item.quantity,
        unitPrice: luggagePrice.get(item.luggageTypeId) ?? new Prisma.Decimal(0),
      })),
    };
  }

  async create(data: CreateData, client: Prisma.TransactionClient = this.prisma) {
    const items = await this.priceItems(data.extraServices ?? [], data.luggage, client);

    return client.booking.create({
      data: {
        userId: data.userId ?? null,
        vehicleCategoryId: data.vehicleCategoryId,
        bookingNumber: data.bookingNumber,
        bookingType: data.bookingType,
        status: data.status,
        totalPrice: data.pricing.total,
        pricing: data.pricing,
        address: data.address,
        passenger: data.passenger,
        bookingTime: data.bookingTime,
        flightDetails: data.flightDetails as Prisma.InputJsonValue,
        meetAndGreet: data.meetAndGreet as Prisma.InputJsonValue,
        notes: data.notes ?? null,
        confirmedAt: data.confirmedAt ?? null,
        luggage: { create: items.luggage },
        extraServices: { create: items.extraServices },
      },
    });
  }

  /**
   * Count + `totalPrice` per (month, status) for one calendar year in APP_TIMEZONE (US Eastern);
   * one customer's when `userId` is set.
   */
  analyticsRows(year: number, userId?: string): Promise<AnalyticsRow[]> {
    const from =
      wallClock(APP_TIMEZONE, `${year}-01-01`, "00:00") ?? new Date(Date.UTC(year, 0, 1));
    const to =
      wallClock(APP_TIMEZONE, `${year + 1}-01-01`, "00:00") ?? new Date(Date.UTC(year + 1, 0, 1));
    const byUser = userId ? Prisma.sql`AND "userId" = ${userId}` : Prisma.empty;

    return this.prisma.$queryRaw<AnalyticsRow[]>`
      SELECT
        EXTRACT(MONTH FROM ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${APP_TIMEZONE}))::int AS month,
        "status" AS status,
        COUNT(*)::int AS count,
        COALESCE(SUM("totalPrice"), 0)::float8 AS amount
      FROM "Booking"
      WHERE "deletedAt" IS NULL
        AND "createdAt" >= ${from}
        AND "createdAt" < ${to}
        ${byUser}
      GROUP BY 1, 2
    `;
  }

  findOwnedByUser(id: string, userId: string) {
    return this.prisma.booking.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        vehicleCategory: {
          select: {
            id: true,
            name: true,
            description: true,
            image: true,
            passengerCount: true,
          },
        },
        luggage: itemsInclude.luggage,
        extraServices: itemsInclude.extraServices,
      },
    });
  }

  update(id: string, data: UpdateData) {
    return this.prisma.$transaction(async (tx) => {
      const items = await this.priceItems(data.extraServices ?? [], data.luggage ?? [], tx);

      if (data.luggage !== undefined) {
        await tx.bookingLuggage.deleteMany({ where: { bookingId: id } });
        await tx.bookingLuggage.createMany({
          data: items.luggage.map((item) => ({
            bookingId: id,
            luggageTypeId: item.luggageTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        });
      }

      if (data.extraServices !== undefined) {
        await tx.bookingExtraService.deleteMany({ where: { bookingId: id } });
        await tx.bookingExtraService.createMany({
          data: items.extraServices.map((item) => ({
            bookingId: id,
            extraServiceId: item.extraServiceId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        });
      }

      const bookingUpdate: Prisma.BookingUncheckedUpdateInput = {};
      if (data.vehicleCategoryId !== undefined) {
        bookingUpdate.vehicleCategoryId = data.vehicleCategoryId;
      }
      if (data.bookingType !== undefined) {
        bookingUpdate.bookingType = data.bookingType;
      }
      if (data.pricing !== undefined) {
        bookingUpdate.pricing = data.pricing;
        bookingUpdate.totalPrice = data.pricing.total;
      }
      if (data.address !== undefined) {
        bookingUpdate.address = data.address;
      }
      if (data.passenger !== undefined) {
        bookingUpdate.passenger = data.passenger;
      }
      if (data.bookingTime !== undefined) {
        bookingUpdate.bookingTime = data.bookingTime;
      }
      if (data.flightDetails !== undefined) {
        bookingUpdate.flightDetails = data.flightDetails as Prisma.InputJsonValue;
      }
      if (data.meetAndGreet !== undefined) {
        bookingUpdate.meetAndGreet = data.meetAndGreet as Prisma.InputJsonValue;
      }
      if (data.notes !== undefined) {
        bookingUpdate.notes = data.notes ?? null;
      }

      return tx.booking.update({
        where: { id },
        data: bookingUpdate,
      });
    });
  }

  updateStatus(id: string, status: BookingStatus, data: UpdateStatusData = {}) {
    const bookingUpdate: StatusUpdate = { status };

    if (data.confirmedAt !== undefined) {
      bookingUpdate.confirmedAt = data.confirmedAt;
    }
    if (data.completedAt !== undefined) {
      bookingUpdate.completedAt = data.completedAt;
    }
    if (data.cancelledAt !== undefined) {
      bookingUpdate.cancelledAt = data.cancelledAt;
    }
    if (data.cancellationReason !== undefined) {
      bookingUpdate.cancellationReason = data.cancellationReason;
    }

    return this.prisma.booking.update({
      where: { id },
      data: bookingUpdate,
    });
  }

  delete(id: string) {
    return this.prisma.booking.delete({
      where: { id },
    });
  }

  bulkRemove(ids: string[]) {
    return this.prisma.booking.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
