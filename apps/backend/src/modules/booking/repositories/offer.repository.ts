import { Inject, Injectable } from "@nestjs/common";
import { BookingOfferStatus, BookingStatus, type Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CreateOfferData } from "../types/offer";

const driverSelect = {
  id: true,
  firstName: true,
  lastName: true,
  avatarUrl: true,
  ratingAvg: true,
  completedTrips: true,
} as const;

const vehicleSelect = {
  id: true,
  make: true,
  model: true,
  licensePlate: true,
} as const;

const offerInclude = {
  driver: { select: driverSelect },
  vehicle: { select: vehicleSelect },
} satisfies Prisma.BookingOfferInclude;

const offerWithBookingInclude = {
  driver: { select: driverSelect },
  vehicle: { select: vehicleSelect },
  booking: {
    select: {
      id: true,
      bookingNumber: true,
      status: true,
      pricing: true,
      address: true,
      vehicleCategoryId: true,
      userId: true,
      offerSessionExpiresAt: true,
      acceptedOfferId: true,
      passenger: true,
      bookingTime: true,
      bookingType: true,
    },
  },
} satisfies Prisma.BookingOfferInclude;

@Injectable()
export class OfferRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  create(data: CreateOfferData) {
    return this.prisma.bookingOffer.create({
      data: {
        bookingId: data.bookingId,
        driverId: data.driverId,
        vehicleId: data.vehicleId,
        quotedPrice: data.quotedPrice,
        etaMinutes: data.etaMinutes,
        distance: data.distance,
        fairPriceDelta: data.fairPriceDelta,
        expiresAt: data.expiresAt,
        status: BookingOfferStatus.PENDING,
      },
      include: offerInclude,
    });
  }

  findById(id: string) {
    return this.prisma.bookingOffer.findFirst({
      where: { id, deletedAt: null },
      include: offerWithBookingInclude,
    });
  }

  findPendingByBookingDriver(bookingId: string, driverId: string) {
    return this.prisma.bookingOffer.findFirst({
      where: {
        bookingId,
        driverId,
        status: BookingOfferStatus.PENDING,
        deletedAt: null,
      },
    });
  }

  listPendingByBooking(bookingId: string) {
    return this.prisma.bookingOffer.findMany({
      where: {
        bookingId,
        status: BookingOfferStatus.PENDING,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: offerInclude,
      orderBy: { quotedPrice: "asc" },
    });
  }

  listByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.bookingOffer.findMany({
      where: { id: { in: ids }, deletedAt: null },
      include: offerInclude,
      orderBy: { quotedPrice: "asc" },
    });
  }

  countPendingByBooking(bookingId: string) {
    return this.prisma.bookingOffer.count({
      where: {
        bookingId,
        status: BookingOfferStatus.PENDING,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  listPendingDriverIds(bookingId: string) {
    return this.prisma.bookingOffer
      .findMany({
        where: {
          bookingId,
          status: BookingOfferStatus.PENDING,
          deletedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { driverId: true },
      })
      .then((rows) => rows.map((row) => row.driverId));
  }

  listPendingBookingIdsForDriver(driverId: string) {
    return this.prisma.bookingOffer
      .findMany({
        where: {
          driverId,
          status: BookingOfferStatus.PENDING,
          deletedAt: null,
          expiresAt: { gt: new Date() },
        },
        select: { bookingId: true },
      })
      .then((rows) => rows.map((row) => row.bookingId));
  }

  countPendingByDriver(driverId: string) {
    return this.prisma.bookingOffer.count({
      where: {
        driverId,
        status: BookingOfferStatus.PENDING,
        deletedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  updateStatus(id: string, status: BookingOfferStatus) {
    return this.prisma.bookingOffer.update({
      where: { id },
      data: { status },
      include: offerInclude,
    });
  }

  async recalcFairPriceDeltas(bookingId: string, fairPrice: number) {
    const pending = await this.prisma.bookingOffer.findMany({
      where: {
        bookingId,
        status: BookingOfferStatus.PENDING,
        deletedAt: null,
      },
      select: { id: true, quotedPrice: true },
    });
    if (pending.length === 0) {
      return;
    }
    await this.prisma.$transaction(
      pending.map((row) =>
        this.prisma.bookingOffer.update({
          where: { id: row.id },
          data: { fairPriceDelta: Number((row.quotedPrice - fairPrice).toFixed(2)) },
        }),
      ),
    );
  }

  supersedeOthers(bookingId: string, acceptedOfferId: string) {
    return this.prisma.bookingOffer.updateMany({
      where: {
        bookingId,
        id: { not: acceptedOfferId },
        status: BookingOfferStatus.PENDING,
        deletedAt: null,
      },
      data: { status: BookingOfferStatus.SUPERSEDED },
    });
  }

  expireStale(now = new Date()) {
    return this.prisma.bookingOffer.updateMany({
      where: {
        status: BookingOfferStatus.PENDING,
        deletedAt: null,
        expiresAt: { lte: now },
      },
      data: { status: BookingOfferStatus.EXPIRED },
    });
  }

  findSeekingBookings(params: {
    vehicleCategoryId: string;
    excludeBookingIds?: string[];
    take: number;
    cursor?: string;
  }) {
    const where: Prisma.BookingWhereInput = {
      deletedAt: null,
      status: BookingStatus.SEEKING_OFFERS,
      vehicleCategoryId: params.vehicleCategoryId,
      OR: [{ offerSessionExpiresAt: null }, { offerSessionExpiresAt: { gt: new Date() } }],
    };

    const excludeIds = params.excludeBookingIds ?? [];
    if (excludeIds.length > 0 && params.cursor) {
      where.id = { notIn: excludeIds, lt: params.cursor };
    } else if (excludeIds.length > 0) {
      where.id = { notIn: excludeIds };
    } else if (params.cursor) {
      where.id = { lt: params.cursor };
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params.take,
      select: {
        id: true,
        bookingNumber: true,
        pricing: true,
        address: true,
        bookingTime: true,
        passenger: true,
        vehicleCategoryId: true,
        offerSessionExpiresAt: true,
        matchingRadius: true,
        createdAt: true,
      },
    });
  }

  findDriversByIds(ids: string[]) {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.driver.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        presenceStatus: "ONLINE",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        fcmToken: true,
        lastLat: true,
        lastLng: true,
        ratingAvg: true,
        completedTrips: true,
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            licensePlate: true,
            vehicleCategoryId: true,
            deletedAt: true,
          },
        },
        settings: { select: { push: true } },
      },
    });
  }

  countCompletedTrips(driverId: string) {
    return this.prisma.trip.count({
      where: { driverId, status: "COMPLETED", deletedAt: null },
    });
  }

  findDriverCardStats(driverId: string) {
    return this.prisma.driver.findFirst({
      where: { id: driverId, deletedAt: null },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        ratingAvg: true,
        completedTrips: true,
        vehicle: {
          select: { make: true, model: true, licensePlate: true },
        },
      },
    });
  }

  incrementCompletedTrips(driverId: string) {
    return this.prisma.driver.update({
      where: { id: driverId },
      data: { completedTrips: { increment: 1 } },
    });
  }
}
