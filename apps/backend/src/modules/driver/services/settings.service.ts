import { Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import type { UpdateSettingsDto } from "../dto/settings.dto";
import { DriverRepository } from "../repositories/driver.repository";
import { DriverSettingsRepository } from "../repositories/settings.repository";
import { requireDriver } from "../utils/require-driver";

@Injectable()
export class DriverSettingsService {
  constructor(
    @Inject(DriverRepository) private readonly driverRepository: DriverRepository,
    @Inject(DriverSettingsRepository)
    private readonly settingsRepository: DriverSettingsRepository,
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  async getSettings(request: Request) {
    const driver = await requireDriver(this.driverRepository, request);

    const settings = await this.settingsRepository.getSettings(driver.id);

    return {
      email: settings.email,
      push: settings.push,
      timezone: settings.timezone,
    };
  }

  async updateSettings(body: UpdateSettingsDto, request: Request) {
    const context = toRequestContext(request);
    const driver = await requireDriver(this.driverRepository, request);

    const current = await this.settingsRepository.getSettings(driver.id);
    const email = body.email !== undefined ? body.email : current.email;
    const push = body.push !== undefined ? body.push : current.push;
    const timezone = body.timezone !== undefined ? body.timezone : current.timezone;

    const settings = await this.settingsRepository.updateSettings(driver.id, {
      email,
      push,
      timezone,
    });

    await auditLog({
      prisma: this.prisma,
      event: "driver.settings_updated",
      result: "success",
      context,
      userId: context.userId,
      metadata: {
        driverId: driver.id,
        applicationNumber: driver.applicationNumber,
        email: settings.email,
        push: settings.push,
        timezone: settings.timezone,
      },
    });

    return {
      email: settings.email,
      push: settings.push,
      timezone: settings.timezone,
    };
  }
}
