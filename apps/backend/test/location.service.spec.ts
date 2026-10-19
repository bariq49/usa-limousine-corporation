import { ForbiddenException } from "@nestjs/common";
import { LocationService } from "../src/modules/trip/services/location.service";
import type { WebsocketIdentity } from "../src/infrastructure/websocket/types/websocket.types";

describe("LocationService", () => {
  const identity: WebsocketIdentity = {
    userId: "u1",
    sessionId: "s1",
    expiresAt: 2_000_000_000,
  };

  const prisma = {
    driver: { findFirst: jest.fn() },
    trip: { findFirst: jest.fn() },
  };
  const store = {
    tryAcquireRate: jest.fn(),
    save: jest.fn(),
    clear: jest.fn(),
  };
  const history = {
    append: jest.fn(),
    flush: jest.fn(),
  };
  const realtime = {
    emit: jest.fn(),
    join: jest.fn(),
    leave: jest.fn(),
  };
  const geo = {
    upsert: jest.fn(),
    remove: jest.fn(),
  };

  const service = new LocationService(
    prisma as never,
    store as never,
    history as never,
    realtime as never,
    geo as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.driver.findFirst.mockResolvedValue({ id: "d1" });
    prisma.trip.findFirst.mockResolvedValue({ id: "t1", driverId: "d1" });
    store.tryAcquireRate.mockResolvedValue(true);
    store.save.mockResolvedValue(undefined);
    history.append.mockResolvedValue(undefined);
    geo.upsert.mockResolvedValue(undefined);
  });

  it("publishes location to redis, history, geo, and rooms", async () => {
    const payload = await service.publish(identity, {
      tripId: "t1",
      lat: 52.31,
      lng: 4.76,
      heading: 120,
      speed: 14.2,
      accuracy: 8,
      timestamp: Date.now(),
    });

    expect(payload).toEqual(
      expect.objectContaining({
        tripId: "t1",
        driverId: "d1",
        lat: 52.31,
        lng: 4.76,
        heading: 120,
      }),
    );
    expect(store.save).toHaveBeenCalled();
    expect(history.append).toHaveBeenCalledWith(payload);
    expect(geo.upsert).toHaveBeenCalledWith({
      driverId: "d1",
      lat: 52.31,
      lng: 4.76,
    });
    expect(realtime.emit).toHaveBeenCalledWith(payload);
  });

  it("rejects updates that are too frequent", async () => {
    store.tryAcquireRate.mockResolvedValue(false);

    await expect(
      service.publish(identity, {
        tripId: "t1",
        lat: 52.31,
        lng: 4.76,
        timestamp: Date.now(),
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(store.save).not.toHaveBeenCalled();
  });

  it("rejects when trip is not active for driver", async () => {
    prisma.trip.findFirst.mockResolvedValue(null);

    await expect(
      service.publish(identity, {
        tripId: "t1",
        lat: 52.31,
        lng: 4.76,
        timestamp: Date.now(),
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
