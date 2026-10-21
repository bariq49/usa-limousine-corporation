import { BookingStatus, BookingType } from "@prisma/client";
import { BookingService } from "../src/modules/booking/services/booking.service";

describe("BookingService.createManual", () => {
  it("creates a confirmed booking", async () => {
    const create = jest.fn(async (data: { status: string; confirmedAt?: Date }) => ({
      id: "book-1",
      bookingNumber: "BK-1",
      status: data.status,
      confirmedAt: data.confirmedAt,
    }));
    const findById = jest.fn(async () => ({
      id: "book-1",
      bookingNumber: "BK-1",
      status: BookingStatus.CONFIRMED,
    }));
    const service = new BookingService(
      { create, findById } as never,
      { nextBooking: async () => 1 } as never,
      { auditLog: { create: jest.fn(async () => undefined) } } as never,
      { stageForAdmins: jest.fn(), deliverStaged: jest.fn() } as never,
    );

    const result = await service.createManual(
      {
        vehicleCategoryId: "cat-1",
        bookingType: BookingType.ONE_WAY,
        address: {
          pickup: { address: "A" },
          distance: 10,
          duration: 20,
        },
        passenger: {
          passengerCount: 1,
          name: "Ada",
          phone: "+316",
          email: "ada@example.com",
        },
        bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:00" },
        pricing: { basePrice: 50, total: 50 },
      },
      { headers: {}, user: { sub: "user-driver" } } as never,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: BookingStatus.CONFIRMED,
        confirmedAt: expect.any(Date),
        bookingType: BookingType.ONE_WAY,
      }),
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: "book-1",
        status: BookingStatus.CONFIRMED,
      }),
    );
  });
});

describe("BookingService.create", () => {
  it("creates a pending booking and stages admin notifications in the same transaction", async () => {
    const tx = { marker: "tx" };
    const booking = { id: "book-2", bookingNumber: "BK-2", status: BookingStatus.PENDING };
    const create = jest.fn(async () => booking);
    const findOwnedByUser = jest.fn(async () => booking);
    const staged = [{ id: "notification-1" }];
    const stageForAdmins = jest.fn(async () => staged);
    const deliverStaged = jest.fn(async () => undefined);
    const prisma = {
      auditLog: { create: jest.fn(async () => undefined) },
      $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx)),
    };

    const service = new BookingService(
      { create, findOwnedByUser } as never,
      { nextBooking: async () => 2 } as never,
      prisma as never,
      { stageForAdmins, deliverStaged } as never,
    );

    const result = await service.create(
      {
        vehicleCategoryId: "cat-1",
        address: { pickup: { address: "A" }, distance: 10, duration: 20 },
        passenger: { passengerCount: 1, name: "Ada", phone: "+316", email: "ada@example.com" },
        bookingTime: { pickupDate: "2026-09-11", pickupTime: "14:00" },
        pricing: { basePrice: 50, total: 50 },
      } as never,
      { headers: {}, user: { sub: "customer-user", sid: "s1", roles: [] } } as never,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ status: BookingStatus.PENDING, userId: "customer-user" }),
      tx,
    );
    expect(stageForAdmins).toHaveBeenCalledWith(
      expect.objectContaining({
        excludeUserId: "customer-user",
        idempotencyKey: "BOOKING_CREATED:book-2",
      }),
      tx,
    );
    expect(deliverStaged).toHaveBeenCalledWith(staged);
    expect(result.id).toBe("book-2");
  });
});

describe("BookingService.buildAnalytics", () => {
  it("folds (month, status) rows into yearly totals and Jan..Dec buckets", async () => {
    const analyticsRows = jest.fn(async () => [
      { month: 1, status: BookingStatus.COMPLETED, count: 2, amount: 150.5 },
      { month: 1, status: BookingStatus.PENDING, count: 1, amount: 80 },
      { month: 3, status: BookingStatus.CONFIRMED, count: 4, amount: 400 },
      { month: 12, status: BookingStatus.CANCELLED, count: 1, amount: 60 },
      { month: 12, status: BookingStatus.COMPLETED, count: 1, amount: 99.25 },
    ]);
    const service = new BookingService(
      { analyticsRows } as never,
      {} as never,
      {} as never,
      {} as never,
    );

    const result = await service.buildAnalytics(2026, "user-1");

    expect(analyticsRows).toHaveBeenCalledWith(2026, "user-1");
    expect(result.totalBookings).toBe(9);
    expect(result.completedBookings).toBe(3);
    expect(result.confirmedBookings).toBe(4);
    expect(result.pendingBookings).toBe(1);
    expect(result.cancelledBookings).toBe(1);
    // Revenue only counts completed bookings.
    expect(result.totalRevenue).toBe(249.75);
    expect(result.monthlyRevenue[0]).toBe(150.5);
    expect(result.monthlyRevenue[11]).toBe(99.25);
    expect(result.monthlyBookings.confirmed[2]).toBe(4);
    expect(result.monthlyBookings.cancelled[11]).toBe(1);
    expect(result.monthlyRevenue).toHaveLength(12);
  });
});
