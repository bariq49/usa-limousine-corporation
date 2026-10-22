import { ConflictException } from "@nestjs/common";
import { PricingService } from "../src/modules/vehicle-categories/services/pricing.service";

describe("PricingService overlap", () => {
  const pricing = {
    findOverlapping: jest.fn(),
    create: jest.fn(async (body: unknown) => body),
  };
  const categories = { findById: jest.fn(async () => ({ id: "cat-1" })) };
  const service = new PricingService(pricing as never, categories as never);

  beforeEach(() => jest.clearAllMocks());

  it("rejects an active tier that overlaps another active tier", async () => {
    pricing.findOverlapping.mockResolvedValue({ id: "other" });

    await expect(
      service.create({
        vehicleCategoryId: "cat-1",
        minimumDistance: 10,
        maximumDistance: 20,
      } as never),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(pricing.findOverlapping).toHaveBeenCalledWith({
      vehicleCategoryId: "cat-1",
      minimumDistance: 10,
      maximumDistance: 20,
    });
  });

  it("allows inactive tiers without checking overlap", async () => {
    await service.create({
      vehicleCategoryId: "cat-1",
      minimumDistance: 10,
      status: "INACTIVE",
    } as never);

    expect(pricing.findOverlapping).not.toHaveBeenCalled();
    expect(pricing.create).toHaveBeenCalled();
  });
});
