import { Inject, Injectable } from "@nestjs/common";
import { BookingStatus, Prisma, TripStatus, type TripEventType } from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { ACTIVE_TRIP_STATUSES, IN_PROGRESS } from "../constants/trip.constants";
import type {
  ActiveForDriver,
  ApplyDriverRating,
  CreateData,
  DriverReviewData,
  FindManyParams,
  ReviewData,
  TripUpdate,
  UpdateStatusData,
} from "../types/trip";

const bookingDetailInclude = {
  vehicleCategory: {
    select: {
      id: true,
      name: true,
    },
  },
  luggage: {
    include: {
      luggageType: {
        select: {
          id: true,
          name: true,
          isSpecial: true,
        },
      },
    },
  },
} satisfies Prisma.BookingInclude;

const tripDriverSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  ratingAvg: true,
  ratingCount: true,
  completedTrips: true,
} satisfies Prisma.DriverSelect;

const tripVehicleSelect = {
  id: true,
  make: true,
  model: true,
  year: true,
  color: true,
  licensePlate: true,
  vehicleCategory: { select: { id: true, name: true } },
} satisfies Prisma.DriverVehicleSelect;

const tripInclude = {
  booking: {
    include: bookingDetailInclude,
  },
  driver: {
    select: tripDriverSelect,
  },
  vehicle: {
    select: tripVehicleSelect,
  },
} satisfies Prisma.TripInclude;

@Injectable()
export class TripRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findMany(params: FindManyParams) {
    const { query, driverId, userId, statuses, pickupDate } = params;

    const initialFilter: Prisma.TripWhereInput = {
      deletedAt: null,
    };

    if (driverId !== undefined) {
      initialFilter.driverId = driverId;
    }

    if (statuses !== undefined && statuses.length > 0) {
      initialFilter.status = { in: statuses };
    }

    const bookingFilter: Prisma.BookingWhereInput = {};

    if (userId !== undefined) {
      bookingFilter.userId = userId;
      bookingFilter.deletedAt = null;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const pricingFilter: Record<string, unknown> = { path: ["total"] };
      if (query.minPrice !== undefined) pricingFilter["gte"] = Number(query.minPrice);
      if (query.maxPrice !== undefined) pricingFilter["lte"] = Number(query.maxPrice);
      bookingFilter.pricing = pricingFilter as Prisma.JsonFilter;
    }

    if (pickupDate?.equals !== undefined) {
      bookingFilter.bookingTime = {
        path: ["pickupDate"],
        equals: pickupDate.equals,
      };
    } else if (pickupDate?.lte !== undefined) {
      const day = pickupDate.lte;
      initialFilter.AND = [
        {
          OR: [
            { status: { in: IN_PROGRESS } },
            {
              AND: [
                { status: TripStatus.ACCEPTED },
                {
                  booking: {
                    bookingTime: {
                      path: ["pickupDate"],
                      lte: day,
                    },
                  },
                },
              ],
            },
          ],
        },
      ];
    } else if (pickupDate?.fromNow !== undefined) {
      const { date, time } = pickupDate.fromNow;
      bookingFilter.OR = [
        {
          bookingTime: {
            path: ["pickupDate"],
            gt: date,
          },
        },
        {
          AND: [
            {
              bookingTime: {
                path: ["pickupDate"],
                equals: date,
              },
            },
            {
              bookingTime: {
                path: ["pickupTime"],
                gte: time,
              },
            },
          ],
        },
      ];
    } else if (pickupDate?.gt !== undefined) {
      bookingFilter.bookingTime = {
        path: ["pickupDate"],
        gt: pickupDate.gt,
      };
    }

    if (Object.keys(bookingFilter).length > 0) {
      initialFilter.booking = bookingFilter;
    }

    const upcomingSort = pickupDate?.gt !== undefined || pickupDate?.fromNow !== undefined;

    const feature = new APIFeature(query, {
      initialFilter,
      filterFields: statuses === undefined ? ["status"] : [],
      sort: {
        allowedFields: [
          "createdAt",
          "updatedAt",
          "acceptedAt",
          "completedAt",
          "cancelledAt",
          "status",
          "price",
        ],
        defaultSortBy: upcomingSort ? "acceptedAt" : "createdAt",
        defaultSortOrder: upcomingSort ? "asc" : "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) => {
        let orderBy = args.orderBy as
          Record<string, "asc" | "desc"> | Array<Record<string, "asc" | "desc">>;
        if (!Array.isArray(orderBy) && orderBy?.["price"]) {
          orderBy = { booking: { pricing: orderBy["price"] } } as unknown as Record<
            string,
            "asc" | "desc"
          >;
        } else if (Array.isArray(orderBy)) {
          orderBy = orderBy.map((o: Record<string, "asc" | "desc">) =>
            o["price"]
              ? ({ booking: { pricing: o["price"] } } as unknown as Record<string, "asc" | "desc">)
              : o,
          );
        }

        return this.prisma.trip.findMany({
          where: args.where as never,
          orderBy: orderBy as never,
          skip: args.skip,
          take: args.take,
          include: tripInclude,
        });
      },
      count: ({ where }) => this.prisma.trip.count({ where: where as never }),
    });
  }

  findByIdForDriver(id: string, driverId: string) {
    return this.prisma.trip.findFirst({
      where: { id, driverId, deletedAt: null },
      include: tripInclude,
    });
  }

  findActiveForDriver(params: ActiveForDriver) {
    const where: Prisma.TripWhereInput = {
      driverId: params.driverId,
      deletedAt: null,
      status: { in: params.statuses ?? IN_PROGRESS },
    };
    if (params.excludeId) {
      where.id = { not: params.excludeId };
    }

    return this.prisma.trip.findFirst({
      where,
      select: { id: true },
    });
  }

  listOpenByDriver(driverId: string, db: Prisma.TransactionClient | PrismaService = this.prisma) {
    return db.trip.findMany({
      where: {
        driverId,
        deletedAt: null,
        status: { in: ACTIVE_TRIP_STATUSES },
      },
      select: {
        booking: {
          select: {
            bookingTime: true,
            address: true,
          },
        },
      },
    });
  }

  findByBookingId(bookingId: string) {
    return this.prisma.trip.findFirst({
      where: { bookingId, deletedAt: null },
    });
  }

  findBooking(id: string) {
    return this.prisma.booking.findFirst({
      where: { id, deletedAt: null },
      include: {
        trip: { select: { id: true } },
      },
    });
  }

  create(data: CreateData, db: Prisma.TransactionClient | PrismaService = this.prisma) {
    return db.trip.create({
      data: {
        bookingId: data.bookingId,
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        status: TripStatus.ACCEPTED,
        acceptedAt: new Date(),
      },
      include: tripInclude,
    });
  }

  updateStatus(id: string, data: UpdateStatusData) {
    return this.prisma.$transaction(async (tx) => {
      const current = await tx.trip.findUniqueOrThrow({ where: { id } });

      const tripUpdate: TripUpdate = { status: data.status };

      if (data.startedAt !== undefined) {
        tripUpdate.startedAt = data.startedAt;
      }
      if (data.arrivedAtPickupAt !== undefined) {
        tripUpdate.arrivedAtPickupAt = data.arrivedAtPickupAt;
      }
      if (data.pickedUpAt !== undefined) {
        tripUpdate.pickedUpAt = data.pickedUpAt;
      }
      if (data.droppedOffAt !== undefined) {
        tripUpdate.droppedOffAt = data.droppedOffAt;
      }
      if (data.completedAt !== undefined) {
        tripUpdate.completedAt = data.completedAt;
      }
      if (data.cancelledAt !== undefined) {
        tripUpdate.cancelledAt = data.cancelledAt;
      }
      if (data.cancellationReason !== undefined) {
        tripUpdate.cancellationReason = data.cancellationReason;
      }

      await tx.trip.update({
        where: { id },
        data: tripUpdate,
      });

      await tx.tripEvent.create({
        data: {
          tripId: id,
          event: data.status as TripEventType,
          actorUserId: data.actorUserId,
          previousStatus: current.status,
          newStatus: data.status,
        },
      });

      if (data.status === TripStatus.COMPLETED) {
        await tx.booking.update({
          where: { id: current.bookingId },
          data: {
            status: BookingStatus.COMPLETED,
            completedAt: new Date(),
          },
        });
      }

      if (data.status === TripStatus.CANCELLED) {
        const bookingUpdate: {
          status: BookingStatus;
          cancelledAt: Date;
          cancellationReason?: string;
        } = {
          status: BookingStatus.CANCELLED,
          cancelledAt: new Date(),
        };

        if (data.cancellationReason !== undefined) {
          bookingUpdate.cancellationReason = data.cancellationReason;
        }

        await tx.booking.update({
          where: { id: current.bookingId },
          data: bookingUpdate,
        });
      }

      return tx.trip.findUniqueOrThrow({
        where: { id },
        include: tripInclude,
      });
    });
  }

  findReviewByTripId(tripId: string, driverId: string) {
    return this.prisma.tripReview.findFirst({
      where: { tripId, driverId },
    });
  }

  createReview(data: ReviewData) {
    return this.prisma.tripReview.create({
      data: {
        tripId: data.tripId,
        driverId: data.driverId,
        bookingId: data.bookingId,
        rating: data.rating,
        comment: data.comment ?? null,
        passenger: data.passenger === null ? Prisma.JsonNull : data.passenger,
      },
    });
  }

  findByIdForCustomer(id: string, userId: string) {
    return this.prisma.trip.findFirst({
      where: {
        id,
        deletedAt: null,
        booking: { userId, deletedAt: null },
      },
      include: tripInclude,
    });
  }

  findTrackingForCustomer(id: string, userId: string) {
    return this.prisma.trip.findFirst({
      where: {
        id,
        deletedAt: null,
        booking: { userId, deletedAt: null },
      },
      include: {
        driver: {
          select: tripDriverSelect,
        },
        vehicle: {
          select: tripVehicleSelect,
        },
        booking: {
          include: {
            vehicleCategory: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  findDriverReviewByTripId(tripId: string) {
    return this.prisma.driverReview.findFirst({
      where: { tripId },
    });
  }

  createDriverReview(data: DriverReviewData) {
    return this.prisma.driverReview.create({
      data: {
        tripId: data.tripId,
        driverId: data.driverId,
        bookingId: data.bookingId,
        customerId: data.customerId,
        rating: data.rating,
        comment: data.comment ?? null,
      },
    });
  }

  async applyDriverRating(props: ApplyDriverRating) {
    const { driverId, rating } = props;
    const driver = await this.prisma.driver.findFirst({
      where: { id: driverId, deletedAt: null },
      select: { ratingAvg: true, ratingCount: true },
    });
    if (!driver) {
      return;
    }
    const count = driver.ratingCount;
    const nextCount = count + 1;
    const nextAvg = (driver.ratingAvg * count + rating) / nextCount;
    await this.prisma.driver.update({
      where: { id: driverId },
      data: {
        ratingAvg: Number(nextAvg.toFixed(2)),
        ratingCount: nextCount,
      },
    });
  }
}
