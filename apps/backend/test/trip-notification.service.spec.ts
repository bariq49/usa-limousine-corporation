import { Test, type TestingModule } from "@nestjs/testing";
import { BookingStatus, DriverPresenceStatus, TripStatus } from "@prisma/client";
import { PrismaService } from "../src/infrastructure/database/prisma.service";
import { NotifyService } from "../src/modules/booking/services/notify.service";
import { OfferService } from "../src/modules/booking/services/offer.service";
import { ChatService } from "../src/modules/chat/services/chat.service";
import { DriverRepository } from "../src/modules/driver/repositories/driver.repository";
import { DriverRequestEventService } from "../src/modules/driver/services/request-event.service";
import { DriverWalletService } from "../src/modules/driver/services/wallet.service";
import { DriverRealtimeService } from "../src/modules/driver/websocket/driver-realtime.service";
import { NotificationService } from "../src/modules/notification/services/notification.service";
import { RefundService } from "../src/modules/payment/services/refund.service";
import { TripRepository } from "../src/modules/trip/repositories/trip.repository";
import { LocationService } from "../src/modules/trip/services/location.service";
import { TripService } from "../src/modules/trip/services/trip.service";
import { SubscriptionService } from "../src/modules/subscription/services/subscription.service";
import { WalletService } from "../src/modules/wallet/services/wallet.service";
import { CalendarService } from "../src/modules/calendar/services/calendar.service";
import { SettingsRepository } from "../src/modules/settings/repositories/settings.repository";

const calendarStub = {
  provide: CalendarService,
  useValue: {
    create: jest.fn(async () => undefined),
  },
};

const settingsStub = {
  provide: SettingsRepository,
  useValue: {
    get: jest.fn(async () => ({})),
    getCancelPolicy: jest.fn(async () => ({
      paymentTimeoutMin: 15,
      cancelRefundBeforeStartPercent: 100,
      cancelRefundAfterStartPercent: 50,
      driverCancelRefundPercent: 100,
      driverCancelReseek: false,
      pickupFreeWaitMin: 10,
      noShowRefundPercent: 0,
    })),
  },
};

const prismaForCreate = {
  driverSettings: {
    findUnique: jest.fn(async () => ({ timezone: "Europe/Amsterdam" })),
  },
  $transaction: async (fn: (tx: { $executeRaw: () => Promise<undefined> }) => Promise<unknown>) =>
    fn({ $executeRaw: async () => undefined }),
  auditLog: {
    create: jest.fn(async () => undefined),
  },
};

const locationStub = {
  provide: LocationService,
  useValue: {
    onStart: jest.fn(async () => undefined),
    onEnd: jest.fn(async () => undefined),
  },
};

const subscriptionStub = {
  provide: SubscriptionService,
  useValue: {
    assertCanAcceptTrip: jest.fn(async () => undefined),
    recordTripUse: jest.fn(async () => undefined),
  },
};

const refundStub = {
  provide: RefundService,
  useValue: {
    refundBookingPercent: jest.fn(async () => ({ refundedNow: 0, percent: 100 })),
  },
};

const offerStub = {
  provide: OfferService,
  useValue: { startSeeking: jest.fn(async () => undefined) },
};

const chatStub = {
  provide: ChatService,
  useValue: {
    openForTrip: jest.fn(async () => undefined),
    closeForSubject: jest.fn(async () => undefined),
    resolveTripConversation: jest.fn(async () => null),
  },
};

const requestEventStub = {
  provide: DriverRequestEventService,
  useValue: {
    recordIncoming: jest.fn(async () => undefined),
    attachTrip: jest.fn(async () => undefined),
    markNotAccepted: jest.fn(async () => undefined),
    markClientCancelled: jest.fn(async () => undefined),
    markFinished: jest.fn(async () => undefined),
    markDriverCancelled: jest.fn(async () => undefined),
    markClientTripCancelled: jest.fn(async () => undefined),
    markClientNoShow: jest.fn(async () => undefined),
  },
};

describe("TripService notifications", () => {
  const driver = {
    id: "driver-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "+31000000000",
    presenceStatus: DriverPresenceStatus.ONLINE,
    vehicle: {
      id: "vehicle-1",
      vehicleCategoryId: "cat-1",
    },
  };

  const booking = {
    id: "booking-1",
    bookingNumber: "BK-100",
    status: BookingStatus.CONFIRMED,
    bookingType: "ONE_WAY",
    vehicleCategoryId: "cat-1",
    userId: "user-1",
    confirmedAt: new Date(),
    trip: null as { id: string } | null,
  };

  it("notifies other drivers when a trip is accepted", async () => {
    const notify = jest.fn(async () => undefined);
    const taken = jest.fn(async () => undefined);
    const create = jest.fn(async () => ({
      id: "trip-1",
      bookingId: booking.id,
      driverId: driver.id,
      vehicleId: driver.vehicle.id,
      status: TripStatus.ACCEPTED,
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: TripRepository,
          useValue: {
            findByBookingId: async () => null,
            findBooking: async () => booking,
            listOpenByDriver: async () => [],
            create,
          },
        },
        {
          provide: DriverRepository,
          useValue: {
            findByUserId: async () => driver,
          },
        },
        {
          provide: PrismaService,
          useValue: prismaForCreate,
        },
        {
          provide: NotificationService,
          useValue: {
            notify,
          },
        },
        {
          provide: DriverRealtimeService,
          useValue: { emitWalletCredited: jest.fn() },
        },
        {
          provide: WalletService,
          useValue: { credit: jest.fn() },
        },
        {
          provide: DriverWalletService,
          useValue: { ensureWalletId: jest.fn() },
        },
        {
          provide: NotifyService,
          useValue: { available: jest.fn(), taken },
        },
        locationStub,
        subscriptionStub,
        calendarStub,
        settingsStub,
        refundStub,
        offerStub,
        chatStub,
        requestEventStub,
      ],
    }).compile();

    const service = module.get(TripService);
    await service.create({ bookingId: booking.id }, {
      ip: "127.0.0.1",
      headers: {},
      user: { sub: "user-driver" },
    } as never);

    expect(notify).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
    expect(taken).toHaveBeenCalledWith({
      bookingId: booking.id,
      tripId: "trip-1",
      excludeDriverId: driver.id,
    });
  });

  it("maps unique booking conflict to ConflictException", async () => {
    const { Prisma } = await import("@prisma/client");
    const create = jest.fn(async () => {
      throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      });
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: TripRepository,
          useValue: { findBooking: async () => booking, listOpenByDriver: async () => [], create },
        },
        {
          provide: DriverRepository,
          useValue: {
            findByUserId: async () => driver,
          },
        },
        {
          provide: PrismaService,
          useValue: prismaForCreate,
        },
        {
          provide: NotificationService,
          useValue: {
            notify: jest.fn(),
          },
        },
        {
          provide: DriverRealtimeService,
          useValue: { emitWalletCredited: jest.fn() },
        },
        {
          provide: WalletService,
          useValue: { credit: jest.fn() },
        },
        {
          provide: DriverWalletService,
          useValue: { ensureWalletId: jest.fn() },
        },
        {
          provide: NotifyService,
          useValue: { available: jest.fn(), taken: jest.fn() },
        },
        locationStub,
        subscriptionStub,
        calendarStub,
        settingsStub,
        refundStub,
        offerStub,
        chatStub,
        requestEventStub,
      ],
    }).compile();

    const service = module.get(TripService);
    await expect(
      service.create({ bookingId: booking.id }, {
        ip: "127.0.0.1",
        headers: {},
        user: { sub: "user-driver" },
      } as never),
    ).rejects.toThrow("A trip already exists for this booking");
  });

  it("rejects accept when the time overlaps an existing trip", async () => {
    const create = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: TripRepository,
          useValue: {
            findBooking: async () => ({
              ...booking,
              bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:00" },
              address: { duration: 60 },
              trip: null,
            }),
            listOpenByDriver: async () => [
              {
                booking: {
                  bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:30" },
                  address: { duration: 45 },
                },
              },
            ],
            create,
          },
        },
        {
          provide: DriverRepository,
          useValue: { findByUserId: async () => driver },
        },
        {
          provide: PrismaService,
          useValue: prismaForCreate,
        },
        { provide: NotificationService, useValue: {} },
        { provide: DriverRealtimeService, useValue: { emitWalletCredited: jest.fn() } },
        { provide: WalletService, useValue: {} },
        { provide: DriverWalletService, useValue: {} },
        { provide: NotifyService, useValue: {} },
        locationStub,
        subscriptionStub,
        calendarStub,
        settingsStub,
        refundStub,
        offerStub,
        chatStub,
        requestEventStub,
      ],
    }).compile();

    const service = module.get(TripService);
    await expect(
      service.create({ bookingId: booking.id }, {
        ip: "127.0.0.1",
        headers: {},
        user: { sub: "user-driver" },
      } as never),
    ).rejects.toThrow("You already have a booking at this time");
    expect(create).not.toHaveBeenCalled();
  });

  it("rejects start when another trip is already in progress", async () => {
    const updateStatus = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: TripRepository,
          useValue: {
            findByIdForDriver: async () => ({
              id: "trip-2",
              bookingId: booking.id,
              driverId: driver.id,
              status: TripStatus.ACCEPTED,
            }),
            findActiveForDriver: async () => ({ id: "trip-1" }),
            updateStatus,
          },
        },
        {
          provide: DriverRepository,
          useValue: { findByUserId: async () => driver },
        },
        {
          provide: PrismaService,
          useValue: { auditLog: { create: jest.fn() } },
        },
        { provide: NotificationService, useValue: {} },
        { provide: DriverRealtimeService, useValue: { emitWalletCredited: jest.fn() } },
        { provide: WalletService, useValue: {} },
        { provide: DriverWalletService, useValue: {} },
        { provide: NotifyService, useValue: {} },
        locationStub,
        subscriptionStub,
        calendarStub,
        settingsStub,
        refundStub,
        offerStub,
        chatStub,
        requestEventStub,
      ],
    }).compile();

    const service = module.get(TripService);
    await expect(
      service.start("trip-2", {
        ip: "127.0.0.1",
        headers: {},
        user: { sub: "user-driver" },
      } as never),
    ).rejects.toThrow("You already have a started trip");
    expect(updateStatus).not.toHaveBeenCalled();
  });

  it("rejects start before the booking pickup time", async () => {
    const updateStatus = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: TripRepository,
          useValue: {
            findByIdForDriver: async () => ({
              id: "trip-2",
              bookingId: booking.id,
              driverId: driver.id,
              status: TripStatus.ACCEPTED,
              booking: {
                bookingTime: { pickupDate: "2099-01-01", pickupTime: "10:00" },
              },
            }),
            updateStatus,
          },
        },
        {
          provide: DriverRepository,
          useValue: { findByUserId: async () => driver },
        },
        {
          provide: PrismaService,
          useValue: {
            driverSettings: {
              findUnique: async () => ({ timezone: "America/New_York" }),
            },
            auditLog: { create: jest.fn() },
          },
        },
        { provide: NotificationService, useValue: {} },
        { provide: DriverRealtimeService, useValue: { emitWalletCredited: jest.fn() } },
        { provide: WalletService, useValue: {} },
        { provide: DriverWalletService, useValue: {} },
        { provide: NotifyService, useValue: {} },
        locationStub,
        subscriptionStub,
        calendarStub,
        settingsStub,
        refundStub,
        offerStub,
        chatStub,
        requestEventStub,
      ],
    }).compile();

    const service = module.get(TripService);
    await expect(
      service.start("trip-2", {
        ip: "127.0.0.1",
        headers: {},
        user: { sub: "user-driver" },
      } as never),
    ).rejects.toThrow("Cannot start trip before the booking time");
    expect(updateStatus).not.toHaveBeenCalled();
  });

  it("notifies driver and credits wallet on trip complete", async () => {
    const notify = jest.fn(async () => undefined);
    const emitWalletCredited = jest.fn();
    const credit = jest.fn(async () => ({
      credited: true,
      amount: 80,
      balance: 80,
      transactionId: "wt-1",
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: TripRepository,
          useValue: {
            findByIdForDriver: async () => ({
              id: "trip-1",
              bookingId: booking.id,
              driverId: driver.id,
              vehicleId: driver.vehicle.id,
              status: TripStatus.ARRIVED_AT_DROPOFF,
            }),
            updateStatus: async () => ({
              id: "trip-1",
              bookingId: booking.id,
              driverId: driver.id,
              vehicleId: driver.vehicle.id,
              status: TripStatus.COMPLETED,
            }),
            findBooking: async () => ({
              bookingNumber: booking.bookingNumber,
              bookingType: "ONE_WAY",
              userId: booking.userId,
              pricing: { total: 80 },
              trip: { id: "trip-1" },
            }),
          },
        },
        {
          provide: DriverRepository,
          useValue: {
            findByUserId: async () => driver,
          },
        },
        {
          provide: PrismaService,
          useValue: {
            booking: {
              findFirst: async () => ({
                bookingNumber: booking.bookingNumber,
                userId: booking.userId,
                pricing: { total: 80 },
              }),
            },
            driver: { update: jest.fn(async () => undefined) },
            auditLog: {
              create: jest.fn(async () => undefined),
            },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notify,
            notifyMany: jest.fn(),
          },
        },
        {
          provide: DriverRealtimeService,
          useValue: { emitWalletCredited },
        },
        {
          provide: WalletService,
          useValue: { credit },
        },
        {
          provide: DriverWalletService,
          useValue: { ensureWalletId: jest.fn(async () => "wallet-1") },
        },
        {
          provide: NotifyService,
          useValue: { available: jest.fn(), taken: jest.fn() },
        },
        locationStub,
        subscriptionStub,
        calendarStub,
        settingsStub,
        refundStub,
        offerStub,
        chatStub,
        requestEventStub,
      ],
    }).compile();

    const service = module.get(TripService);
    await service.complete("trip-1", {
      ip: "127.0.0.1",
      headers: {},
      user: { sub: "user-driver" },
    } as never);

    expect(credit).toHaveBeenCalled();
    expect(emitWalletCredited).toHaveBeenCalledWith(
      driver.id,
      expect.objectContaining({ amount: 80, balance: 80 }),
    );
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: driver.id,
        type: "WALLET_CREDITED",
        title: "Wallet credited",
        push: true,
      }),
    );
  });

  it("notifies driver on trip cancel", async () => {
    const notify = jest.fn(async () => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: TripRepository,
          useValue: {
            findByIdForDriver: async () => ({
              id: "trip-1",
              bookingId: booking.id,
              driverId: driver.id,
              vehicleId: driver.vehicle.id,
              status: TripStatus.ACCEPTED,
            }),
            updateStatus: async () => ({
              id: "trip-1",
              bookingId: booking.id,
              driverId: driver.id,
              vehicleId: driver.vehicle.id,
              status: TripStatus.CANCELLED,
              cancellationReason: "Passenger requested cancellation",
            }),
            findBooking: async () => ({
              bookingNumber: booking.bookingNumber,
              userId: booking.userId,
              pricing: { total: 80 },
              trip: { id: "trip-1" },
            }),
          },
        },
        {
          provide: DriverRepository,
          useValue: { findByUserId: async () => driver },
        },
        {
          provide: PrismaService,
          useValue: {
            booking: {
              findFirst: async () => ({
                bookingNumber: booking.bookingNumber,
                userId: booking.userId,
                pricing: { total: 80 },
              }),
              update: jest.fn(async () => undefined),
            },
            auditLog: { create: jest.fn(async () => undefined) },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notify,
          },
        },
        {
          provide: DriverRealtimeService,
          useValue: { emitWalletCredited: jest.fn() },
        },
        { provide: WalletService, useValue: { credit: jest.fn() } },
        { provide: DriverWalletService, useValue: { ensureWalletId: jest.fn() } },
        { provide: NotifyService, useValue: { available: jest.fn(), taken: jest.fn() } },
        locationStub,
        subscriptionStub,
        calendarStub,
        settingsStub,
        refundStub,
        offerStub,
        chatStub,
        requestEventStub,
      ],
    }).compile();

    const service = module.get(TripService);
    await service.cancel("trip-1", { cancellationReason: "Passenger requested cancellation" }, {
      ip: "127.0.0.1",
      headers: {},
      user: { sub: "user-driver" },
    } as never);

    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: driver.id,
        type: "TRIP_CANCELLED",
        title: "Trip cancelled",
        push: true,
      }),
    );
  });
});
