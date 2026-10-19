import { DriverStatsService } from "../src/modules/driver/services/stats.service";
import type { DriverRepository } from "../src/modules/driver/repositories/driver.repository";
import type { DriverSettingsRepository } from "../src/modules/driver/repositories/settings.repository";
import type { DriverStatsRepository } from "../src/modules/driver/repositories/stats.repository";

describe("DriverStatsService", () => {
  const drivers = {
    findByUserId: jest.fn(),
  };
  const settings = {
    getSettings: jest.fn(),
  };
  const stats = {
    getStats: jest.fn(),
  };

  const request = {
    user: { sub: "user-1" },
  } as never;

  let service: DriverStatsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DriverStatsService(
      drivers as unknown as DriverRepository,
      settings as unknown as DriverSettingsRepository,
      stats as unknown as DriverStatsRepository,
    );
  });

  it("returns today stats for the authenticated driver", async () => {
    drivers.findByUserId.mockResolvedValue({ id: "driver-1" });
    settings.getSettings.mockResolvedValue({ timezone: "Europe/Amsterdam" });
    stats.getStats.mockResolvedValue({
      todayEarnings: 42.5,
      acceptedRides: 3,
      cancelledRides: 1,
      pendingRides: 2,
    });

    const result = await service.getStats(request);

    expect(settings.getSettings).toHaveBeenCalledWith("driver-1");
    expect(stats.getStats).toHaveBeenCalledWith(
      expect.objectContaining({
        driverId: "driver-1",
        start: expect.any(Date),
        end: expect.any(Date),
      }),
    );
    expect(result).toEqual({
      todayEarnings: 42.5,
      acceptedRides: 3,
      cancelledRides: 1,
      pendingRides: 2,
    });
  });
});
