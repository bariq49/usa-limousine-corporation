import { BadRequestException, ConflictException } from "@nestjs/common";
import { TripStatus } from "@prisma/client";
import type { PrismaService } from "../src/infrastructure/database/prisma.service";
import type { NotifyService } from "../src/modules/booking/services/notify.service";
import type { DriverRepository } from "../src/modules/driver/repositories/driver.repository";
import type { DriverWalletService } from "../src/modules/driver/services/wallet.service";
import type { NotificationService } from "../src/modules/notification/services/notification.service";
import type { TripRepository } from "../src/modules/trip/repositories/trip.repository";
import { TripService } from "../src/modules/trip/services/trip.service";
import type { LocationService } from "../src/modules/trip/services/location.service";
import type { WalletService } from "../src/modules/wallet/services/wallet.service";

describe("TripService.review", () => {
  const tripRepository = {
    findByIdForDriver: jest.fn(),
    findReviewByTripId: jest.fn(),
    createReview: jest.fn(),
    findBooking: jest.fn(),
  };
  const driverRepository = {
    findByUserId: jest.fn(),
  };
  const prisma = {
    auditLog: { create: jest.fn() },
  };

  const request = {
    headers: {},
    user: { sub: "user-1", sid: "s1", email: "d@test.com", roles: [] },
  } as never;

  let service: TripService;

  beforeEach(() => {
    jest.clearAllMocks();
    driverRepository.findByUserId.mockResolvedValue({ id: "driver-1" });
    service = new TripService(
      tripRepository as unknown as TripRepository,
      driverRepository as unknown as DriverRepository,
      prisma as unknown as PrismaService,
      {} as NotificationService,
      { emitWalletCredited: jest.fn() } as never,
      {} as WalletService,
      {} as DriverWalletService,
      {} as NotifyService,
      {} as LocationService,
      {
        assertCanAcceptTrip: jest.fn(),
        recordTripUse: jest.fn(),
      } as never,
      { create: jest.fn() } as never,
      {
        get: async () => ({}),
        getCancelPolicy: async () => ({
          paymentTimeoutMin: 15,
          cancelRefundBeforeStartPercent: 100,
          cancelRefundAfterStartPercent: 50,
          driverCancelRefundPercent: 100,
          driverCancelReseek: false,
          pickupFreeWaitMin: 10,
          noShowRefundPercent: 0,
        }),
      } as never,
      {} as never,
      {} as never,
      {} as never,
      {
        recordIncoming: jest.fn(async () => undefined),
        attachTrip: jest.fn(async () => undefined),
        markNotAccepted: jest.fn(async () => undefined),
        markClientCancelled: jest.fn(async () => undefined),
        markFinished: jest.fn(async () => undefined),
        markDriverCancelled: jest.fn(async () => undefined),
        markClientTripCancelled: jest.fn(async () => undefined),
        markClientNoShow: jest.fn(async () => undefined),
      } as never,
    );
  });

  it("rejects review when trip is not completed", async () => {
    tripRepository.findByIdForDriver.mockResolvedValue({
      id: "trip-1",
      driverId: "driver-1",
      bookingId: "book-1",
      status: TripStatus.ACCEPTED,
    });

    await expect(service.review("trip-1", { rating: 5 }, request)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it("rejects duplicate review", async () => {
    tripRepository.findByIdForDriver.mockResolvedValue({
      id: "trip-1",
      driverId: "driver-1",
      bookingId: "book-1",
      status: TripStatus.COMPLETED,
    });
    tripRepository.findReviewByTripId.mockResolvedValue({ id: "rev-1" });

    await expect(
      service.review("trip-1", { rating: 4, comment: "Good" }, request),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it("creates a passenger review for a completed trip", async () => {
    tripRepository.findByIdForDriver.mockResolvedValue({
      id: "trip-1",
      driverId: "driver-1",
      bookingId: "book-1",
      status: TripStatus.COMPLETED,
    });
    tripRepository.findReviewByTripId.mockResolvedValue(null);
    tripRepository.findBooking.mockResolvedValue({
      id: "book-1",
      passenger: { name: "John", phone: "+316" },
    });
    tripRepository.createReview.mockResolvedValue({
      id: "rev-1",
      tripId: "trip-1",
      rating: 5,
      comment: "Nice passenger",
    });

    const result = await service.review(
      "trip-1",
      { rating: 5, comment: "Nice passenger" },
      request,
    );

    expect(tripRepository.createReview).toHaveBeenCalledWith(
      expect.objectContaining({
        tripId: "trip-1",
        driverId: "driver-1",
        bookingId: "book-1",
        rating: 5,
        comment: "Nice passenger",
      }),
    );
    expect(result.id).toBe("rev-1");
  });
});
