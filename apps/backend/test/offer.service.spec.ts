import { BadRequestException, ConflictException } from "@nestjs/common";
import { BookingOfferStatus, BookingStatus, DriverPresenceStatus } from "@prisma/client";
import { OfferService } from "../src/modules/booking/services/offer.service";

describe("OfferService", () => {
  const fairBooking = {
    id: "book1",
    bookingNumber: "BK-1",
    status: BookingStatus.SEEKING_OFFERS,
    vehicleCategoryId: "cat1",
    pricing: { total: 100 },
    address: {
      pickup: { latitude: 52.37, longitude: 4.89, address: "A" },
      distance: 10,
      duration: 20,
    },
    userId: "user1",
    offerSessionExpiresAt: new Date(Date.now() + 60_000),
    acceptedOfferId: null,
    passenger: { passengerCount: 1 },
    bookingTime: { pickupDate: "2026-08-25", pickupTime: "14:00" },
  };

  function buildService(overrides: Record<string, unknown> = {}) {
    const offers = {
      create: jest.fn(async (data: { quotedPrice: number }) => ({
        id: "offer1",
        bookingId: "book1",
        driverId: "driver1",
        vehicleId: "veh1",
        quotedPrice: data.quotedPrice,
        status: BookingOfferStatus.PENDING,
        expiresAt: new Date(Date.now() + 60_000),
        etaMinutes: 3,
        distance: 1,
        fairPriceDelta: data.quotedPrice - 100,
        driver: { id: "driver1", firstName: "A", lastName: "H", avatarUrl: null },
        vehicle: { id: "veh1", make: "Toyota", model: "Camry", licensePlate: "X" },
      })),
      findPendingByBookingDriver: jest.fn(async () => null),
      countPendingByBooking: jest.fn(async () => 0),
      countPendingByDriver: jest.fn(async () => 0),
      countCompletedTrips: jest.fn(async () => 10),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      listPendingByBooking: jest.fn(async () => []),
      listByIds: jest.fn(async () => []),
      listPendingDriverIds: jest.fn(async () => []),
      listPendingBookingIdsForDriver: jest.fn(async () => []),
      supersedeOthers: jest.fn(),
      expireStale: jest.fn(),
      findSeekingBookings: jest.fn(async () => []),
      findDriversByIds: jest.fn(async () => []),
      avgDriverRating: jest.fn(),
      recalcFairPriceDeltas: jest.fn(async () => undefined),
      ...((overrides["offers"] as object) ?? {}),
    };

    const bookings = {
      findById: jest.fn(async () => fairBooking),
      findOwnedByUser: jest.fn(async () => fairBooking),
      findCurrentForUser: jest.fn(async () => fairBooking),
      updatePricing: jest.fn(async (_id: string, pricing: { total: number }) => ({
        ...fairBooking,
        pricing,
      })),
      updateOfferSession: jest.fn(),
      findStaleSeeking: jest.fn(async () => []),
      updateMatchingRadius: jest.fn(),
      listOnlineDriverIdsForCategory: jest.fn(async () => []),
      ...((overrides["bookings"] as object) ?? {}),
    };

    const drivers = {
      findByUserId: jest.fn(async () => ({
        id: "driver1",
        presenceStatus: DriverPresenceStatus.ONLINE,
        lastLat: 52.37,
        lastLng: 4.89,
        firstName: "A",
        lastName: "H",
        avatarUrl: null,
        vehicle: {
          id: "veh1",
          vehicleCategoryId: "cat1",
          make: "Toyota",
          model: "Camry",
          licensePlate: "X",
          deletedAt: null,
        },
      })),
      ...((overrides["drivers"] as object) ?? {}),
    };

    const cache = {
      claimIdem: jest.fn(async () => true),
      addOffer: jest.fn(),
      trackDrivers: jest.fn(),
      putCard: jest.fn(),
      tryLock: jest.fn(async () => true),
      releaseLock: jest.fn(),
      listDrivers: jest.fn(async () => ["driver1", "driver2"]),
      listOffers: jest.fn(async () => []),
      removeOffer: jest.fn(),
      clearSession: jest.fn(),
      putSession: jest.fn(),
      updateSessionFairPrice: jest.fn(),
      getCard: jest.fn(async () => null),
      ...((overrides["cache"] as object) ?? {}),
    };

    const realtime = {
      offerCreated: jest.fn(),
      offerUpdated: jest.fn(),
      resultToDrivers: jest.fn(),
      sessionExpired: jest.fn(),
      requestToDrivers: jest.fn(),
    };

    const queue = {
      enqueueMatchDispatch: jest.fn(),
      enqueueOfferExpire: jest.fn(),
      enqueueSessionExpire: jest.fn(),
      enqueueRadiusExpand: jest.fn(),
    };

    const checkout = {
      createSession: jest.fn(async () => ({
        paymentId: "pay1",
        checkoutUrl: "https://checkout.example",
        sessionId: "cs_1",
      })),
    };

    const prisma = {
      booking: { update: jest.fn(), findFirst: jest.fn() },
      bookingOffer: { update: jest.fn(), updateMany: jest.fn() },
      trip: { findFirst: jest.fn(), create: jest.fn() },
      driverBookingDecline: {
        findMany: jest.fn(async () => []),
        findUnique: jest.fn(async () => null),
        upsert: jest.fn(async () => ({})),
      },
      auditLog: { create: jest.fn(async () => ({})) },
      $transaction: jest.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn({
          $executeRaw: jest.fn(),
          booking: {
            findFirst: jest.fn(async () => fairBooking),
            update: jest.fn(),
          },
          bookingOffer: {
            update: jest.fn(),
            updateMany: jest.fn(),
          },
          trip: {
            findFirst: jest.fn(async () => null),
            create: jest.fn(async () => ({ id: "trip1", bookingId: "book1", driverId: "driver1" })),
          },
        }),
      ),
      ...((overrides["prisma"] as object) ?? {}),
    };

    const settings = {
      getOfferMarketplace: jest.fn(async () => ({
        radius: 8,
        expandStep: 4,
        expandMax: 24,
        geoMatchCount: 80,
        maxPerBooking: 20,
        maxQuotesPerDriver: 5,
        ttlMin: 5,
        sessionTtlMin: 15,
        quoteMinFactor: 0.5,
        quoteMaxFactor: 2.5,
      })),
      ...((overrides["settings"] as object) ?? {}),
    };

    const service = new OfferService(
      offers as never,
      bookings as never,
      drivers as never,
      prisma as never,
      cache as never,
      realtime as never,
      { dispatch: jest.fn() } as never,
      queue as never,
      checkout as never,
      {
        taken: jest.fn(),
        available: jest.fn(),
        offerReceived: jest.fn(),
        offerAccepted: jest.fn(),
      } as never,
      { emit: jest.fn() } as never,
      {
        seek: jest.fn(async () => undefined),
        quote: jest.fn(async () => undefined),
        accept: jest.fn(async () => undefined),
        list: jest.fn(async () => undefined),
      } as never,
      { incr: jest.fn(async () => undefined), timing: jest.fn(async () => undefined) } as never,
      {
        markBusy: jest.fn(async () => undefined),
        markFree: jest.fn(async () => undefined),
      } as never,
      settings as never,
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

    return { service, offers, bookings, cache, checkout, prisma, realtime };
  }

  it("rejects quotes outside fair-price bounds", async () => {
    const { service } = buildService();
    await expect(
      service.quote({ bookingId: "book1", quotedPrice: 10 }, {
        user: { sub: "u1" },
        headers: {},
      } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("creates a quote within bounds", async () => {
    const { service, offers, realtime } = buildService();
    const offer = await service.quote({ bookingId: "book1", quotedPrice: 110 }, {
      user: { sub: "u1" },
      headers: {},
    } as never);
    expect(offers.create).toHaveBeenCalled();
    expect(offer.id).toBe("offer1");
    expect(realtime.offerCreated).toHaveBeenCalled();
  });

  it("rejects counter when new total is not higher", async () => {
    const { service } = buildService();
    await expect(
      service.counter("book1", { total: 100 }, { user: { sub: "user1" }, headers: {} } as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("counters booking price upward and notifies drivers", async () => {
    const { service, bookings, cache, realtime } = buildService();
    const result = await service.counter("book1", { total: 120 }, {
      user: { sub: "user1" },
      headers: {},
    } as never);
    expect(bookings.updatePricing).toHaveBeenCalledWith(
      "book1",
      expect.objectContaining({ total: 120 }),
    );
    expect(cache.updateSessionFairPrice).toHaveBeenCalledWith({
      bookingId: "book1",
      fairPrice: 120,
    });
    expect(realtime.requestToDrivers).toHaveBeenCalled();
    expect(result.booking).toBeTruthy();
  });

  it("accept race: second accept fails when lock held by other offer", async () => {
    const { service } = buildService({
      offers: {
        findById: jest.fn(async () => ({
          id: "offer2",
          bookingId: "book1",
          driverId: "driver1",
          status: BookingOfferStatus.PENDING,
          expiresAt: new Date(Date.now() + 60_000),
          booking: fairBooking,
        })),
      },
      cache: {
        tryLock: jest.fn(async () => false),
        claimIdem: jest.fn(async () => true),
        addOffer: jest.fn(),
        trackDrivers: jest.fn(),
        putCard: jest.fn(),
        releaseLock: jest.fn(),
        listDrivers: jest.fn(async () => []),
        listOffers: jest.fn(async () => []),
        removeOffer: jest.fn(),
        clearSession: jest.fn(),
        putSession: jest.fn(),
        getCard: jest.fn(async () => null),
      },
    });

    await expect(
      service.accept("offer2", {}, { user: { sub: "user1" }, headers: {} } as never),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
