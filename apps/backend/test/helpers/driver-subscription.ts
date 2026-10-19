import { Audience, SubscriptionInterval, SubscriptionStatus } from "@prisma/client";
import type { PrismaService } from "../../src/infrastructure/database/prisma.service";

export async function cleanupSubscriptionTables(prisma: PrismaService): Promise<void> {
  await prisma.subscriptionEvent.deleteMany();
  await prisma.subscriptionPeriod.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
}

export async function seedActiveDriverSubscription(prisma: PrismaService, driverId: string) {
  const plan = await prisma.subscriptionPlan.create({
    data: {
      audience: Audience.DRIVER,
      name: "E2E Driver Plan",
      amount: 29.99,
      interval: SubscriptionInterval.MONTH,
      features: [],
      tripsPerMonth: null,
    },
  });

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return prisma.subscription.create({
    data: {
      planId: plan.id,
      audience: Audience.DRIVER,
      referenceId: driverId,
      status: SubscriptionStatus.ACTIVE,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
    },
  });
}
