import type { PrismaService } from "../../src/infrastructure/database/prisma.service";

export type BookingFixtureSeed = {
  vehicleCategoryId: string;
  luggageTypeId: string;
};

export function buildBookingPayload(
  params: {
    vehicleCategoryId: string;
    luggageTypeId?: string;
  },
  options?: { passengerEmail?: string },
) {
  return {
    vehicleCategoryId: params.vehicleCategoryId,
    bookingType: "ONE_WAY",
    address: {
      pickup: {
        address: "Schiphol Airport",
        latitude: 52.3105,
        longitude: 4.7683,
      },
      dropoff: {
        address: "Dam Square, Amsterdam",
        latitude: 52.3731,
        longitude: 4.8932,
      },
      stops: [],
      distance: 18.5,
      duration: 32,
    },
    passenger: {
      passengerCount: 2,
      name: "John Doe",
      phone: "+31612345678",
      email: options?.passengerEmail ?? "john@example.com",
    },
    bookingTime: {
      pickupDate: "2026-08-25",
      pickupTime: "14:30",
      returnDate: null,
      returnTime: null,
    },
    pricing: {
      basePrice: 55.55,
      total: 55.55,
    },
    successUrl: "http://localhost:3001/booking/success",
    cancelUrl: "http://localhost:3001/booking/cancel",
    ...(params.luggageTypeId
      ? {
          luggage: [{ luggageTypeId: params.luggageTypeId, quantity: 1 }],
        }
      : {}),
  };
}

export async function seedBookingFixtures(prisma: PrismaService): Promise<BookingFixtureSeed> {
  const stamp = Date.now();

  const category = await prisma.vehicleCategory.create({
    data: {
      name: `Sedan ${stamp}`,
      passengerCount: 4,
      isActive: true,
    },
  });

  const luggageType = await prisma.luggageType.create({
    data: {
      name: `Cabin ${stamp}`,
      isActive: true,
    },
  });

  await prisma.vehicleCategoryLuggageCapacity.create({
    data: {
      categoryId: category.id,
      luggageTypeId: luggageType.id,
      quantity: 2,
    },
  });

  return {
    vehicleCategoryId: category.id,
    luggageTypeId: luggageType.id,
  };
}

export { cleanupBookingAndTripTables } from "./cleanup-payment";
