import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import {
  BookingStatus,
  PaymentStatus,
  Prisma,
  RoleKey,
  type PaymentMode,
} from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { wallClock } from "../../../common/utils/day-bounds";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { QueryDto } from "../dto/booking.dto";
import type {
  AnalyticsRow,
  CreateData,
  ExtraServiceItemInput,
  FindForCalendarParams,
  LuggageItemInput,
  PricedItems,
  StatusUpdate,
  UpdateData,
  UpdateStatusData,
} from "../types/booking";
import { bookingItemsInclude, bookingPaymentSelect } from "../types/booking";

@Injectable()
export class BookingRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findMany(query: QueryDto, userId?: string) {
    const initialFilter: Prisma.BookingWhereInput = { deletedAt: null };
    if (userId) {
      initialFilter.userId = userId;
    }

    const feature = new APIFeature(query, {
      initialFilter,
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

  findForCalendar(params: FindForCalendarParams) {
    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      status: { in: params.statuses },
      AND: [
        { bookingTime: { path: ["pickupDate"], gte: params.start } },
        { bookingTime: { path: ["pickupDate"], lte: params.end } },
      ],
    };
    if (params.bookingTypes?.length) {
      where.bookingType = { in: params.bookingTypes };
    }
    if (params.userId) {
      where.userId = params.userId;
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: 1000,
      select: {
        id: true,
        bookingNumber: true,
        status: true,
        bookingType: true,
        address: true,
        passenger: true,
        bookingTime: true,
        vehicleCategory: { select: { name: true } },
      },
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
        luggage: bookingItemsInclude.luggage,
        extraServices: bookingItemsInclude.extraServices,
        payment: bookingPaymentSelect,
      },
    });
  }

  attachPaymentLink(
    id: string,
    link: { orderId: string; id: string; url: string },
    mode: PaymentMode,
  ) {
    return this.prisma.booking.update({
      where: { id },
      data: {
        squareOrderId: link.orderId,
        squarePaymentLinkId: link.id,
        squarePaymentLinkUrl: link.url,
        paymentMode: mode,
      },
    });
  }

  findPaymentForRefund(bookingId: string) {
    return this.prisma.payment.findUnique({
      where: { bookingId },
      select: { id: true, status: true, mode: true, amount: true, squarePaymentId: true },
    });
  }

  async recordRefund(paymentId: string, amount: number, refundId: string) {
    const result = await this.prisma.payment.updateMany({
      where: { id: paymentId, status: PaymentStatus.PAID },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAmount: amount,
        refundedAt: new Date(),
        squareRefundId: refundId,
      },
    });
    return result.count > 0;
  }

  async contactPreferences(userId: string | null) {
    if (!userId) return { email: true, sms: true };
    const customer = await this.prisma.customer.findUnique({
      where: { userId },
      select: { settings: { select: { email: true, sms: true } } },
    });
    return { email: customer?.settings?.email ?? true, sms: customer?.settings?.sms ?? true };
  }

  async findCustomerIdByEmail(email: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: { equals: email.trim(), mode: "insensitive" },
        isEmailVerified: true,
        isActive: true,
        roles: { some: { role: { key: RoleKey.CUSTOMER } } },
      },
      select: { id: true },
    });
    return user?.id ?? null;
  }

  findByOrderId(orderId: string) {
    return this.prisma.booking.findFirst({
      where: { squareOrderId: orderId, deletedAt: null },
      select: {
        id: true,
        status: true,
        bookingNumber: true,
        passenger: true,
        paymentMode: true,
        squarePaymentLinkId: true,
      },
    });
  }

  findUnpaidCheckouts(createdBefore: Date) {
    return this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        squareOrderId: { not: null },
        payment: null,
        createdAt: { lt: createdBefore },
        deletedAt: null,
      },
      select: { squareOrderId: true },
      take: 50,
    });
  }

  async vehicleCapacity(categoryId: string) {
    const category = await this.prisma.vehicleCategory.findFirst({
      where: { id: categoryId, isActive: true, deletedAt: null },
      select: { passengerCount: true, luggageCapacity: { select: { quantity: true } } },
    });
    if (!category) return null;

    return {
      passengers: category.passengerCount,
      luggage: category.luggageCapacity.reduce((total, item) => total + item.quantity, 0),
    };
  }

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
        select: { id: true, name: true, price: true },
      }),
      client.luggageType.findMany({
        where: { id: { in: luggage.map((item) => item.luggageTypeId) }, isActive: true },
        select: { id: true, name: true, price: true },
      }),
    ]);

    const servicePrice = new Map(services.map((row) => [row.id, row.price]));
    const luggagePrice = new Map(luggageTypes.map((row) => [row.id, row.price]));
    const serviceName = new Map(services.map((row) => [row.id, row.name]));
    const luggageName = new Map(luggageTypes.map((row) => [row.id, row.name]));

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
        returnQuantity: item.returnQuantity ?? 0,
        unitPrice: servicePrice.get(item.extraServiceId) as Prisma.Decimal,
        name: serviceName.get(item.extraServiceId) ?? "",
      })),
      luggage: luggage.map((item) => ({
        luggageTypeId: item.luggageTypeId,
        quantity: item.quantity,
        unitPrice: luggagePrice.get(item.luggageTypeId) ?? new Prisma.Decimal(0),
        name: luggageName.get(item.luggageTypeId) ?? "",
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
        vehicleCount: data.vehicleCount ?? 1,
        status: data.status,
        totalPrice: data.pricing.total,
        pricing: data.pricing as Prisma.InputJsonValue,
        address: data.address,
        passenger: data.passenger,
        bookingTime: data.bookingTime,
        flightDetails: data.flightDetails as Prisma.InputJsonValue,
        meetAndGreet: data.meetAndGreet as Prisma.InputJsonValue,
        notes: data.notes ?? null,
        returnNotes: data.returnNotes ?? null,
        notifyByEmail: data.notifyByEmail ?? true,
        notifyBySms: data.notifyBySms ?? true,
        confirmedAt: data.confirmedAt ?? null,
        luggage: {
          create: items.luggage.map((item) => ({
            luggageTypeId: item.luggageTypeId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
        extraServices: {
          create: items.extraServices.map((item) => ({
            extraServiceId: item.extraServiceId,
            quantity: item.quantity,
            returnQuantity: item.returnQuantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
    });
  }

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
        luggage: bookingItemsInclude.luggage,
        extraServices: bookingItemsInclude.extraServices,
        payment: bookingPaymentSelect,
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
            returnQuantity: item.returnQuantity,
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
      if (data.returnNotes !== undefined) {
        bookingUpdate.returnNotes = data.returnNotes ?? null;
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
