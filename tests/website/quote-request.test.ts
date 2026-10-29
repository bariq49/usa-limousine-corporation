import { describe, expect, it } from "vitest";
import { quoteRequest } from "../../apps/website/lib/booking/quote-request";

describe("quoteRequest", () => {
  it("builds an hourly payload without requiring a drop-off", () => {
    const request = quoteRequest({
      step1: {
        tripType: "hourly",
        pickupAddress: "JFK Airport",
        deliveryAddress: "",
        stops: [],
        pickupDate: "2030-09-11",
        pickupTime: "14:00",
        hourlyDuration: 4,
        distance: 0,
      },
      returnTrip: null,
      vehicleCategoryId: "sedan",
      vehicleCount: 1,
    });

    expect(request).toEqual(
      expect.objectContaining({
        bookingType: "HOURLY",
        hourlyDuration: 4,
        vehicleCategoryId: "sedan",
        address: expect.objectContaining({
          pickup: { address: "JFK Airport" },
          dropoff: undefined,
        }),
      }),
    );
  });

  it("still requires a drop-off for transfer trips", () => {
    expect(
      quoteRequest({
        step1: {
          tripType: "one-way",
          pickupAddress: "JFK Airport",
          deliveryAddress: "",
          stops: [],
          pickupDate: "2030-09-11",
          pickupTime: "14:00",
          distance: 12,
        },
        returnTrip: null,
      }),
    ).toBeNull();
  });
});
