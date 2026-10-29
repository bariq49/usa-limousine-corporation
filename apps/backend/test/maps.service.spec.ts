import { BadRequestException, ServiceUnavailableException } from "@nestjs/common";
import { MapsService } from "../src/infrastructure/maps/maps.service";

describe("MapsService.calculateDistance", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("fails closed when the API key is missing", async () => {
    const service = new MapsService({ get: () => undefined } as never);
    await expect(
      service.calculateDistance({
        pickup: { address: "A" },
        dropoff: { address: "B" },
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("sums directions legs into miles and minutes", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({
        status: "OK",
        routes: [
          {
            legs: [
              { distance: { value: 1609.344 }, duration: { value: 600 } },
              { distance: { value: 804.672 }, duration: { value: 300 } },
            ],
          },
        ],
      }),
    })) as never;

    const service = new MapsService({ get: () => "test-key" } as never);
    await expect(
      service.calculateDistance({
        pickup: { address: "JFK" },
        dropoff: { address: "Times Square" },
        stops: [{ address: "Brooklyn" }],
      }),
    ).resolves.toEqual({
      distance: 1.5,
      travelDuration: 15
    });
  });

  it("rejects when Google returns no route", async () => {
    global.fetch = jest.fn(async () => ({
      json: async () => ({ status: "ZERO_RESULTS", routes: [] }),
    })) as never;

    const service = new MapsService({ get: () => "test-key" } as never);
    await expect(
      service.calculateDistance({
        pickup: { address: "A" },
        dropoff: { address: "B" },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
