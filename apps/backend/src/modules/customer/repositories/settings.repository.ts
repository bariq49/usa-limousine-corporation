import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { Update } from "../types/settings";

@Injectable()
export class CustomerSettingsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async getSettings(customerId: string) {
    const existing = await this.prisma.customerSettings.findUnique({
      where: { customerId },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.customerSettings.create({
      data: { customerId },
    });
  }

  updateSettings(customerId: string, data: Update) {
    return this.prisma.customerSettings.upsert({
      where: { customerId },
      create: {
        customerId,
        email: data.email,
        notification: data.notification,
      },
      update: {
        email: data.email,
        notification: data.notification,
      },
    });
  }
}
