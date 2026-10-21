import { Inject, Injectable } from "@nestjs/common";
import type { BookingStatus, Prisma } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { QueryDto } from "../dto/booking.dto";
import type { CreateData, StatusUpdate, UpdateData, UpdateStatusData } from "../types/booking";

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
      filterFields: ["status", "bookingType"],
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
        luggage: {
          include: {
            luggageType: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }

  create(data: CreateData, client: Prisma.TransactionClient = this.prisma) {
    return client.booking.create({
      data: {
        userId: data.userId ?? null,
        vehicleCategoryId: data.vehicleCategoryId,
        bookingNumber: data.bookingNumber,
        bookingType: data.bookingType,
        status: data.status,
        pricing: data.pricing,
        address: data.address,
        passenger: data.passenger,
        bookingTime: data.bookingTime,
        flightDetails: data.flightDetails as Prisma.InputJsonValue,
        meetAndGreet: data.meetAndGreet as Prisma.InputJsonValue,
        extraServices: data.extraServices as Prisma.InputJsonValue,
        driverNotes: data.driverNotes ?? null,
        confirmedAt: data.confirmedAt ?? null,
        luggage: {
          create: data.luggage.map((item) => ({
            luggageTypeId: item.luggageTypeId,
            quantity: item.quantity,
          })),
        },
      },
    });
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
        luggage: {
          include: {
            luggageType: {
              select: {
                id: true,
                name: true,
                price: true,
              },
            },
          },
        },
      },
    });
  }

  update(id: string, data: UpdateData) {
    return this.prisma.$transaction(async (tx) => {
      if (data.luggage !== undefined) {
        await tx.bookingLuggage.deleteMany({ where: { bookingId: id } });
        if (data.luggage.length > 0) {
          await tx.bookingLuggage.createMany({
            data: data.luggage.map((item) => ({
              bookingId: id,
              luggageTypeId: item.luggageTypeId,
              quantity: item.quantity,
            })),
          });
        }
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
      if (data.extraServices !== undefined) {
        bookingUpdate.extraServices = data.extraServices as Prisma.InputJsonValue;
      }
      if (data.driverNotes !== undefined) {
        bookingUpdate.driverNotes = data.driverNotes ?? null;
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
