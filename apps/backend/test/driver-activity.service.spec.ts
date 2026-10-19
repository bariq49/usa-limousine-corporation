import { DriverRequestOutcome } from "@prisma/client";
import { DriverActivityService } from "../src/modules/driver/services/activity.service";
import type { DriverRepository } from "../src/modules/driver/repositories/driver.repository";
import type { DriverRequestEventRepository } from "../src/modules/driver/repositories/request-event.repository";
import type { DriverSettingsRepository } from "../src/modules/driver/repositories/settings.repository";

describe("DriverActivityService", () => {
  const drivers = { findByUserId: jest.fn(), findById: jest.fn() };
  const settings = { getSettings: jest.fn() };
  const events = { listForDriver: jest.fn() };

  const request = { user: { sub: "user-1" } } as never;
  let service: DriverActivityService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DriverActivityService(
      drivers as unknown as DriverRepository,
      settings as unknown as DriverSettingsRepository,
      events as unknown as DriverRequestEventRepository,
    );
    drivers.findByUserId.mockResolvedValue({ id: "driver-1" });
    drivers.findById.mockResolvedValue({ id: "driver-1" });
    settings.getSettings.mockResolvedValue({ timezone: "UTC" });
  });

  it("computes acceptance rate for a filtered year/month window", async () => {
    const now = new Date("2026-09-15T12:00:00.000Z");
    jest.useFakeTimers().setSystemTime(now);

    events.listForDriver.mockResolvedValue([
      { outcome: DriverRequestOutcome.FINISHED, createdAt: new Date("2026-08-10T10:00:00.000Z") },
      { outcome: DriverRequestOutcome.FINISHED, createdAt: new Date("2026-08-11T10:00:00.000Z") },
      {
        outcome: DriverRequestOutcome.NOT_ACCEPTED,
        createdAt: new Date("2026-08-12T10:00:00.000Z"),
      },
      {
        outcome: DriverRequestOutcome.NOT_ACCEPTED,
        createdAt: new Date("2026-08-13T10:00:00.000Z"),
      },
      {
        outcome: DriverRequestOutcome.DRIVER_CANCELLED,
        createdAt: new Date("2026-08-14T10:00:00.000Z"),
      },
    ]);

    const result = await service.getActivity(request, {
      year: 2026,
      month: 8,
      groupBy: "month",
    } as never);

    expect(events.listForDriver).toHaveBeenCalledWith(
      expect.objectContaining({
        driverId: "driver-1",
        start: expect.any(Date),
        end: expect.any(Date),
      }),
    );
    expect(result.startDate).toBe("2026-08-01");
    expect(result.endDate).toBe("2026-08-31");
    expect(result.groupBy).toBe("month");
    expect(result.incomingRequests).toBe(5);
    expect(result.finishedRides).toBe(2);
    expect(result.acceptanceRate).toBe(40);
    expect(result.cancelReasons.youDidNotAccept).toEqual({ count: 2, percent: 67 });
    expect(result.cancelReasons.youCancelled).toEqual({ count: 1, percent: 33 });

    jest.useRealTimers();
  });

  it("supports startDate/endDate APIFeature filters", async () => {
    drivers.findById.mockResolvedValue({ id: "driver-1" });
    events.listForDriver.mockResolvedValue([]);

    const result = await service.getForDriver("driver-1", {
      startDate: "2026-07-01",
      endDate: "2026-09-30",
      groupBy: "month",
    } as never);

    expect(result.startDate).toBe("2026-07-01");
    expect(result.endDate).toBe("2026-09-30");
    expect(result.series.map((s) => s.key)).toEqual(["2026-07", "2026-08", "2026-09"]);
  });
});
