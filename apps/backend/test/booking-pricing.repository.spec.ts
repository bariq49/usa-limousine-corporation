import { BadRequestException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { BookingRepository } from "../src/modules/booking/repositories/booking.repository";

describe("BookingRepository.priceItems", () => {
  const client = {
    extraService: {
      findMany: jest.fn(async () => [{ id: "es1", price: new Prisma.Decimal("10.50") }]),
    },
    luggageType: {
      findMany: jest.fn(async () => [{ id: "l1", price: null }]),
    },
  };
  const repository = new BookingRepository(client as never);

  it("captures the current catalog price per item", async () => {
    const result = await repository.priceItems(
      [{ extraServiceId: "es1", quantity: 2 }],
      [{ luggageTypeId: "l1", quantity: 3 }],
      client as never,
    );

    expect(result.extraServices[0]?.unitPrice.toString()).toBe("10.5");
    expect(result.luggage[0]?.unitPrice.toString()).toBe("0");
  });

  it("rejects unknown or inactive items", async () => {
    await expect(
      repository.priceItems([{ extraServiceId: "missing", quantity: 1 }], [], client as never),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
