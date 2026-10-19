import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { Update } from "../types/settings";

@Injectable()
export class DriverSettingsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSettings(driverId: string) {
    const existing = await this.prisma.driverSettings.findUnique({
      where: { driverId },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.driverSettings.create({
      data: { driverId },
    });
  }

  updateSettings(driverId: string, data: Update) {
    return this.prisma.driverSettings.upsert({
      where: { driverId },
      create: {
        driverId,
        email: data.email,
        push: data.push,
        timezone: data.timezone,
      },
      update: {
        email: data.email,
        push: data.push,
        timezone: data.timezone,
      },
    });
  }
}
