import { DriverPresenceStatus, RoleKey } from "@prisma/client";
import { WebsocketRoomsService } from "../src/infrastructure/websocket/websocket-rooms.service";
import type { WebsocketIdentity } from "../src/infrastructure/websocket/types/websocket.types";

describe("WebsocketRoomsService", () => {
  const prisma = {
    driver: {
      findFirst: jest.fn(),
    },
    userRole: {
      findMany: jest.fn(),
    },
    trip: {
      findMany: jest.fn(),
    },
  };
  const roomsService = new WebsocketRoomsService(prisma as never);

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.userRole.findMany.mockResolvedValue([]);
    prisma.trip.findMany.mockResolvedValue([]);
  });

  it("joins user and session rooms when no driver profile exists", async () => {
    prisma.driver.findFirst.mockResolvedValue(null);
    const identity: WebsocketIdentity = {
      userId: "100",
      sessionId: "s1",
      expiresAt: 2_000_000_000,
    };

    await expect(roomsService.forIdentity(identity)).resolves.toEqual(["user:100", "session:s1"]);
  });

  it("joins driver room when offline", async () => {
    prisma.driver.findFirst.mockResolvedValue({
      id: "200",
      presenceStatus: DriverPresenceStatus.OFFLINE,
      vehicle: null,
    });
    const identity: WebsocketIdentity = {
      userId: "100",
      sessionId: "s1",
      expiresAt: 2_000_000_000,
    };

    await expect(roomsService.forIdentity(identity)).resolves.toEqual([
      "user:100",
      "session:s1",
      "driver:200",
    ]);
  });

  it("joins online and category rooms when driver is online", async () => {
    prisma.driver.findFirst.mockResolvedValue({
      id: "200",
      presenceStatus: DriverPresenceStatus.ONLINE,
      vehicle: { vehicleCategoryId: "cat1", deletedAt: null },
    });
    const identity: WebsocketIdentity = {
      userId: "100",
      sessionId: "s1",
      expiresAt: 2_000_000_000,
    };

    await expect(roomsService.forIdentity(identity)).resolves.toEqual([
      "user:100",
      "session:s1",
      "driver:200",
      "drivers:online",
      "drivers:cat:cat1",
    ]);
  });

  it("joins ops fleet room for SUPER_ADMIN", async () => {
    prisma.driver.findFirst.mockResolvedValue(null);
    prisma.userRole.findMany.mockResolvedValue([{ role: { key: RoleKey.SUPER_ADMIN } }]);
    const identity: WebsocketIdentity = {
      userId: "100",
      sessionId: "s1",
      expiresAt: 2_000_000_000,
    };

    await expect(roomsService.forIdentity(identity)).resolves.toEqual([
      "user:100",
      "session:s1",
      "ops:fleet",
    ]);
  });

  it("joins active trip rooms for driver or passenger", async () => {
    prisma.driver.findFirst.mockResolvedValue(null);
    prisma.trip.findMany.mockResolvedValue([{ id: "t1" }, { id: "t2" }]);
    const identity: WebsocketIdentity = {
      userId: "100",
      sessionId: "s1",
      expiresAt: 2_000_000_000,
    };

    await expect(roomsService.forIdentity(identity)).resolves.toEqual([
      "user:100",
      "session:s1",
      "trip:t1",
      "trip:t2",
    ]);
  });
});
