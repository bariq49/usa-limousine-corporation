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
      { startSeeking: jest.fn() } as never,
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
