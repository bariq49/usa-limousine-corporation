import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infrastructure/database/prisma.service";

@Injectable()
export class DriverSubscriptionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findBilling(driverId: string) {
    return this.prisma.driver.findFirst({
      where: { id: driverId, deletedAt: null },
      select: {
        id: true,
        subscriptionFreeUsedAt: true,
        stripeCustomerId: true,
      },
    });
  }

  markFreeUsed(driverId: string, at: Date) {
    return this.prisma.driver.update({
      where: { id: driverId },
      data: { subscriptionFreeUsedAt: at },
    });
  }
}
