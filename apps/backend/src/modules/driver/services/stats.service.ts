import { Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { dayBounds } from "../../../common/utils/day-bounds";
import { APP_TIMEZONE } from "../../../common/utils/format-time";
import { DriverRepository } from "../repositories/driver.repository";
import { DriverSettingsRepository } from "../repositories/settings.repository";
import { DriverStatsRepository } from "../repositories/stats.repository";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverStatsService {
  constructor(
    @Inject(DriverRepository) private readonly drivers: DriverRepository,
    @Inject(DriverSettingsRepository) private readonly settings: DriverSettingsRepository,
    @Inject(DriverStatsRepository) private readonly stats: DriverStatsRepository,
  ) {}

  async getStats(request: Request) {
    const driver = await requireDriver(this.drivers, request);
    const settings = await this.settings.getSettings(driver.id);
    const { start, end } = dayBounds(settings.timezone || APP_TIMEZONE);

    return this.stats.getStats({
      driverId: driver.id,
      start,
      end,
    });
  }
}
