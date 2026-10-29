import { BookingType } from "@prisma/client";
import { EstimateService } from "../src/modules/booking/services/estimate.service";

const trip = {
  bookingType: BookingType.ONE_WAY,
  vehicleCount: 1,
  address: {
    pickup: { address: "A" },
    dropoff: { address: "B" },
    distance: 18,
    travelDuration: 40,
  },
  bookingTime: { pickupDate: "2030-01-01", pickupTime: "10:00" },
};

describe("EstimateService.estimate", () => {
  it("delegates to BookingPricingService.estimate", async () => {
    const pricingService = {
      estimate: jest.fn(async () => [
        {
          vehicleCategory: { id: "sedan" },
          total: 100,
          distance: 18,
          travelDuration: 40,
        },
      ]),
    };
    const service = new EstimateService(pricingService as never);

    const options = await service.estimate(trip as never);

    expect(pricingService.estimate).toHaveBeenCalledWith(trip, false);
    expect(options[0]).toEqual(
      expect.objectContaining({ distance: 18, travelDuration: 40, total: 100 }),
    );
  });
});
