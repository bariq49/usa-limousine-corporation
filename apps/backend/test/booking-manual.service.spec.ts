import { BookingStatus, BookingType } from "@prisma/client";
import { BookingPricingService } from "../src/modules/booking/services/pricing.service";
import { BookingService } from "../src/modules/booking/services/booking.service";
import { CustomerBookingService } from "../src/modules/booking/services/customer-booking.service";

describe("CustomerBookingService.create", () => {
  it("creates a pending booking and stages customer and admin notifications in the same transaction", async () => {
    const tx = { marker: "tx" };
    const booking = { id: "book-2", bookingNumber: "BK-2", status: BookingStatus.PENDING };
    const create = jest.fn(async () => booking);
    const findOwnedByUser = jest.fn(async () => booking);
    const staged = [{ id: "notification-1" }];
    const stageCreated = jest.fn(async () => staged);
    const deliverStaged = jest.fn(async () => undefined);
    const prisma = {
      auditLog: { create: jest.fn(async () => undefined) },
      $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const priceItems = jest.fn(async () => ({ extraServices: [], luggage: [] }));
    const vehicleCapacity = jest.fn(async () => ({ passengers: 4, luggage: 3 }));
    const sendCreated = jest.fn(async () => undefined);
    const rates = {
      fuelSurchargeRate: 0,
      gratuityRate: 10,
      taxRate: 0,
      transactionFeeRate: 0,
      oneWayDiscountRate: 0,
      returnDiscountRate: 0,
      airportPickupFee: 0,
      stopFee: 0,
      meetAndGreetFee: 0,
      minBookingNotice: 0,
      minBookingNoticeUnit: "HOUR",
      minBookingMinutes: 0,
    };

    const pricingService = new BookingPricingService(
      { priceItems, vehicleCapacity } as never,
      { get: async () => rates } as never,
      {
        pricedForDistance: async () => [{ id: "cat-1", basePrice: 100 }],
        pricedForHours: async () => [{ id: "cat-1", basePrice: 100 }],
        findHourlyDurations: async () => [2, 3, 4],
      } as never,
      { calculateDistance: async () => ({ distance: 10, travelDuration: 20 }) } as never,
    );

    const service = new CustomerBookingService(
      { create, findOwnedByUser, priceItems, vehicleCapacity } as never,
      { nextBooking: async () => 2 } as never,
      prisma as never,
      { stageCreated, deliverStaged } as never,
      { get: async () => rates } as never,
      pricingService,
      {} as never,
      { sendCreated } as never,
      {} as never,
    );

    const nextYear = new Date().getFullYear() + 1;
    const result = await service.create(
      {
        vehicleCategoryId: "cat-1",
        address: {
          pickup: { address: "A" },
          dropoff: { address: "B" },
          distance: 10,
          travelDuration: 20,
        },
        passenger: { passengerCount: 1, name: "Ada", phone: "+316", email: "ada@example.com" },
        bookingTime: { pickupDate: `${nextYear}-09-11`, pickupTime: "14:00" },
        pricing: { basePrice: 1, total: 1 },
      } as never,
      { headers: {}, user: { sub: "customer-user", sid: "s1", roles: [] } } as never,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: BookingStatus.PENDING,
        userId: "customer-user",
        pricing: expect.objectContaining({ basePrice: 100, gratuityPrice: 10, total: 110 }),
      }),
      tx,
    );
    expect(stageCreated).toHaveBeenCalledWith(
      expect.objectContaining({
        bookingId: "book-2",
        bookingNumber: "BK-2",
        userId: "customer-user",
      }),
      tx,
    );
    expect(deliverStaged).toHaveBeenCalledWith(staged);
    expect(sendCreated).toHaveBeenCalledWith("book-2");
    expect(result.id).toBe("book-2");
  });
});

describe("BookingPricingService.create checks", () => {
  const nextYear = new Date().getFullYear() + 1;
  const request = { headers: {}, user: { sub: "customer-user", sid: "s1", roles: [] } } as never;
  const pricingService = new BookingPricingService(
    {
      vehicleCapacity: async () => ({ passengers: 4, luggage: 3 }),
      priceItems: async () => ({ extraServices: [], luggage: [] }),
    } as never,
    { get: async () => ({ minBookingMinutes: 0 }) } as never,
    {
      pricedForDistance: async () => [{ id: "cat-1", basePrice: 100 }],
      pricedForHours: async () => [{ id: "cat-1", basePrice: 200 }],
      findHourlyDurations: async () => [2, 3, 4],
    } as never,
    { calculateDistance: async () => ({ distance: 10, travelDuration: 20 }) } as never,
  );
  const service = new CustomerBookingService(
    {
      vehicleCapacity: async () => ({ passengers: 4, luggage: 3 }),
      priceItems: async () => ({ extraServices: [], luggage: [] }),
    } as never,
    {} as never,
    {} as never,
    {} as never,
    { get: async () => ({ minBookingMinutes: 0 }) } as never,
    pricingService,
    {} as never,
    {} as never,
    {} as never,
  );
  const body = (overrides: Record<string, unknown>) =>
    Object.assign(
      {
        vehicleCategoryId: "cat-1",
        bookingType: BookingType.ONE_WAY,
        vehicleCount: 1,
        address: {
          pickup: { address: "A" },
          dropoff: { address: "B" },
          distance: 10,
          travelDuration: 20,
        },
        passenger: { passengerCount: 1, name: "Ada", phone: "+316", email: "ada@example.com" },
        bookingTime: { pickupDate: `${nextYear}-09-11`, pickupTime: "14:00" },
        pricing: { basePrice: 1, total: 1 },
      },
      overrides,
    ) as never;

  it("requires hire hours for hourly bookings", async () => {
    await expect(
      service.create(body({ bookingType: BookingType.HOURLY }), request),
    ).rejects.toThrow("Hourly duration is required");
  });

  it("rejects more passengers or bags than the vehicles hold", async () => {
    await expect(
      service.create(
        body({ passenger: { passengerCount: 5, name: "Ada", phone: "+316", email: "a@b.co" } }),
        request,
      ),
    ).rejects.toThrow("Up to 4 passengers");
    await expect(
      service.create(body({ luggage: [{ luggageTypeId: "l1", quantity: 4 }] }), request),
    ).rejects.toThrow("Up to 3 bags");
  });

  it("allows more passengers when more vehicles are booked", async () => {
    await expect(
      service.create(
        body({
          vehicleCount: 2,
          passenger: { passengerCount: 9, name: "Ada", phone: "+316", email: "a@b.co" },
        }),
        request,
      ),
    ).rejects.toThrow("Up to 8 passengers");
  });

  it("requires the return to come after the pickup", async () => {
    await expect(
      service.create(body({ bookingType: BookingType.RETURN }), request),
    ).rejects.toThrow("Return date and time are required");
    await expect(
      service.create(
        body({
          bookingType: BookingType.RETURN,
          bookingTime: {
            pickupDate: `${nextYear}-09-11`,
            pickupTime: "14:00",
            returnDate: `${nextYear}-09-11`,
            returnTime: "13:00",
          },
        }),
        request,
      ),
    ).rejects.toThrow("after the pickup");
  });
});

describe("BookingService.buildAnalytics", () => {
  it("folds booking events into yearly totals and Jan..Dec buckets", async () => {
    const analyticsEvents = jest.fn(async () => [
      { createdAt: new Date("2026-01-10T12:00:00Z"), status: BookingStatus.COMPLETED, amount: 75.25 },
      { createdAt: new Date("2026-01-20T12:00:00Z"), status: BookingStatus.COMPLETED, amount: 75.25 },
      { createdAt: new Date("2026-01-15T12:00:00Z"), status: BookingStatus.PENDING, amount: 80 },
      { createdAt: new Date("2026-03-05T12:00:00Z"), status: BookingStatus.CONFIRMED, amount: 100 },
      { createdAt: new Date("2026-03-06T12:00:00Z"), status: BookingStatus.CONFIRMED, amount: 100 },
      { createdAt: new Date("2026-03-07T12:00:00Z"), status: BookingStatus.CONFIRMED, amount: 100 },
      { createdAt: new Date("2026-03-08T12:00:00Z"), status: BookingStatus.CONFIRMED, amount: 100 },
      { createdAt: new Date("2026-12-02T12:00:00Z"), status: BookingStatus.CANCELLED, amount: 60 },
      { createdAt: new Date("2026-12-18T12:00:00Z"), status: BookingStatus.COMPLETED, amount: 99.25 },
    ]);
    const service = new BookingService(
      { analyticsEvents } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.buildAnalytics({ year: 2026, userId: "user-1" });

    expect(analyticsEvents).toHaveBeenCalled();
    expect(result.totalBookings).toBe(9);
    expect(result.completedBookings).toBe(3);
    expect(result.confirmedBookings).toBe(4);
    expect(result.pendingBookings).toBe(1);
    expect(result.cancelledBookings).toBe(1);
    expect(result.totalRevenue).toBe(249.75);
    expect(result.monthlyRevenue[0]).toBe(150.5);
    expect(result.monthlyRevenue[11]).toBe(99.25);
    expect(result.monthlyBookings.confirmed[2]).toBe(4);
    expect(result.monthlyBookings.cancelled[11]).toBe(1);
    expect(result.monthlyRevenue).toHaveLength(12);
    expect(result.labels).toHaveLength(12);
    expect(result.month).toBeNull();
  });

  it("returns one bucket per day when a month is requested", async () => {
    const analyticsEvents = jest.fn(async () => [
      { createdAt: new Date("2026-10-05T12:00:00Z"), status: BookingStatus.COMPLETED, amount: 101.3 },
      { createdAt: new Date("2026-10-31T12:00:00Z"), status: BookingStatus.CONFIRMED, amount: 100 },
      { createdAt: new Date("2026-10-31T15:00:00Z"), status: BookingStatus.CONFIRMED, amount: 100 },
    ]);
    const service = new BookingService(
      { analyticsEvents } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.buildAnalytics({ year: 2026, month: 10, userId: "user-1" });

    expect(analyticsEvents).toHaveBeenCalled();
    expect(result.month).toBe(10);
    expect(result.monthlyRevenue).toHaveLength(31);
    expect(result.monthlyRevenue[4]).toBe(101.3);
    expect(result.monthlyBookings.confirmed[30]).toBe(2);
    expect(result.totalBookings).toBe(3);
  });
});

describe("BookingService.buildCalendar", () => {
  const makeService = (findForCalendar: jest.Mock) =>
    new BookingService(
      { findForCalendar } as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

  it("returns bookings in the range as calendar events", async () => {
    const findForCalendar = jest.fn(async () => [
      {
        id: "book-1",
        bookingNumber: "BK-1",
        status: BookingStatus.CONFIRMED,
        bookingType: BookingType.RETURN,
        address: { pickup: { address: "EWR" }, dropoff: { address: "Times Square" } },
        passenger: { name: "Ada", passengerCount: 2 },
        bookingTime: {
          pickupDate: "2026-11-02",
          pickupTime: "14:30",
          returnDate: "2026-11-05",
          returnTime: "09:00",
        },
        vehicleCategory: { name: "Sedan" },
      },
    ]);

    const events = await makeService(findForCalendar).buildCalendar(
      { start: "2026-11-01", end: "2026-11-30" },
      "user-1",
    );

    expect(findForCalendar).toHaveBeenCalledWith(
      expect.objectContaining({
        start: "2026-11-01",
        end: "2026-11-30",
        userId: "user-1",
        statuses: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
      }),
    );
    expect(events).toEqual([
      {
        id: "book-1",
        bookingNumber: "BK-1",
        bookingType: BookingType.RETURN,
        status: BookingStatus.CONFIRMED,
        pickupDate: "2026-11-02",
        pickupTime: "14:30",
        returnDate: "2026-11-05",
        returnTime: "09:00",
        customerName: "Ada",
        vehicleName: "Sedan",
        pickupAddress: "EWR",
        dropoffAddress: "Times Square",
      },
    ]);
  });

  it("rejects ranges longer than 62 days or ending before they start", async () => {
    const service = makeService(jest.fn());

    await expect(service.buildCalendar({ start: "2026-01-01", end: "2026-06-01" })).rejects.toThrow(
      "62 days",
    );
    await expect(service.buildCalendar({ start: "2026-02-01", end: "2026-01-01" })).rejects.toThrow(
      "62 days",
    );
  });
});
