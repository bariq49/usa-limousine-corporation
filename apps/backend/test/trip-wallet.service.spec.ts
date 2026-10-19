import { Test, type TestingModule } from "@nestjs/testing";
import { TripStatus } from "@prisma/client";
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

describe("TripService wallet credit", () => {
  const driver = {
    id: "driver-1",
    firstName: "Ada",
    lastName: "Lovelace",
    email: "ada@example.com",
    phone: "+31000000000",
    vehicle: { id: "vehicle-1", vehicleCategoryId: "cat-1" },
  };

  it("credits wallet when trip becomes COMPLETED", async () => {
    const credit = jest.fn(async () => ({
      credited: true,
      transactionId: "wt-1",
      amount: 80,
      balance: 80,
    }));
    const ensureWalletId = jest.fn(async () => "wallet-1");
    const emitWalletCredited = jest.fn();
    const auditCreate = jest.fn(async () => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: TripRepository,
          useValue: {
            findByIdForDriver: async () => ({
              id: "trip-1",
              bookingId: "booking-1",
              driverId: driver.id,
              vehicleId: driver.vehicle.id,
              status: TripStatus.ARRIVED_AT_DROPOFF,
            }),
            updateStatus: async () => ({
              id: "trip-1",
              bookingId: "booking-1",
              driverId: driver.id,
              vehicleId: driver.vehicle.id,
              status: TripStatus.COMPLETED,
            }),
            findBooking: async () => ({
              bookingNumber: "BK-1",
              userId: "user-1",
              pricing: { total: 80 },
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
            driver: {
              findFirst: async () => null,
              update: jest.fn(async () => undefined),
            },
            auditLog: { create: auditCreate },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notify: jest.fn(async () => undefined),
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
          useValue: { ensureWalletId },
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

    expect(ensureWalletId).toHaveBeenCalledWith(driver.id);
    expect(credit).toHaveBeenCalledWith(
      expect.objectContaining({
        walletId: "wallet-1",
        tripId: "trip-1",
        bookingId: "booking-1",
        amount: 80,
      }),
    );
    expect(emitWalletCredited).toHaveBeenCalledWith(
      driver.id,
      expect.objectContaining({
        tripId: "trip-1",
        bookingId: "booking-1",
        amount: 80,
        balance: 80,
        transactionId: "wt-1",
      }),
    );
    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          event: "wallet.credited",
        }),
      }),
    );
  });

  it("skips wallet credit and audits when pricing.total is invalid", async () => {
    const credit = jest.fn(async () => undefined);
    const auditCreate = jest.fn(async () => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TripService,
        {
          provide: TripRepository,
          useValue: {
            findByIdForDriver: async () => ({
              id: "trip-1",
              bookingId: "booking-1",
              driverId: driver.id,
              vehicleId: driver.vehicle.id,
              status: TripStatus.ARRIVED_AT_DROPOFF,
            }),
            updateStatus: async () => ({
              id: "trip-1",
              bookingId: "booking-1",
              driverId: driver.id,
              vehicleId: driver.vehicle.id,
              status: TripStatus.COMPLETED,
            }),
            findBooking: async () => ({
              bookingNumber: "BK-1",
              userId: "user-1",
              pricing: { total: 0 },
              payment: null,
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
            driver: {
              findFirst: async () => null,
              update: jest.fn(async () => undefined),
            },
            auditLog: { create: auditCreate },
          },
        },
        {
          provide: NotificationService,
          useValue: {
            notify: jest.fn(async () => undefined),
          },
        },
        {
          provide: DriverRealtimeService,
          useValue: { emitWalletCredited: jest.fn() },
        },
        { provide: WalletService, useValue: { credit } },
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
    await service.complete("trip-1", {
      ip: "127.0.0.1",
      headers: {},
      user: { sub: "user-driver" },
    } as never);

    expect(credit).not.toHaveBeenCalled();
    expect(auditCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          event: "wallet.credit_skipped",
          metadata: expect.objectContaining({
            result: "failure",
          }),
        }),
      }),
    );
  });
});

describe("DriverWalletService", () => {
  it("returns wallet for authenticated driver", async () => {
    const get = jest.fn(async () => ({
      id: "w1",
      balance: 12,
      updatedAt: new Date(),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverWalletService,
        {
          provide: DriverRepository,
          useValue: { findByUserId: async () => ({ id: "driver-1" }) },
        },
        {
          provide: WalletService,
          useValue: {
            findByOwner: async () => ({ id: "w1" }),
            get,
            list: jest.fn(),
          },
        },
      ],
    }).compile();

    const service = module.get(DriverWalletService);
    const result = await service.getWallet({
      user: { sub: "user-1", sid: "s1", email: "a@b.com", roles: [] },
    } as never);

    expect(get).toHaveBeenCalledWith("w1");
    expect(result.balance).toBe(12);
  });
});
