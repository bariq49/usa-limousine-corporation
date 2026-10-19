import { Inject, Injectable } from "@nestjs/common";
import { SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type {
  CreateData,
  EventData,
  IdQuery,
  NowQuery,
  OpenPeriodUpdate,
  OwnerQuery,
  PeriodData,
  TrialEndingQuery,
  UpdateInput,
} from "../types/subscription";

@Injectable()
export class SubscriptionRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findById(query: IdQuery) {
    const { id } = query;
    return this.prisma.subscription.findUnique({
      where: { id },
      include: { plan: true, pendingPlan: true },
    });
  }

  findCurrentByOwner(query: OwnerQuery) {
    const { audience, referenceId } = query;
    return this.prisma.subscription.findFirst({
      where: {
        audience,
        referenceId,
        status: {
          in: [
            SubscriptionStatus.INCOMPLETE,
            SubscriptionStatus.TRIALING,
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAST_DUE,
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      include: { plan: true, pendingPlan: true },
    });
  }

  create(data: CreateData) {
    const { planId, audience, referenceId, status } = data;
    return this.prisma.subscription.create({
      data: {
        planId,
        audience,
        referenceId,
        status: status ?? SubscriptionStatus.INCOMPLETE,
      },
      include: { plan: true, pendingPlan: true },
    });
  }

  update(input: UpdateInput) {
    const { id, data } = input;
    return this.prisma.subscription.update({
      where: { id },
      data,
      include: { plan: true, pendingPlan: true },
    });
  }

  createEvent(data: EventData) {
    const { subscriptionId, type, payload } = data;
    if (payload === undefined) {
      return this.prisma.subscriptionEvent.create({
        data: { subscriptionId, type },
      });
    }
    return this.prisma.subscriptionEvent.create({
      data: { subscriptionId, type, payload },
    });
  }

  createPeriod(data: PeriodData) {
    const { subscriptionId, planId, periodStart, periodEnd, tripsLimit } = data;
    return this.prisma.subscriptionPeriod.create({
      data: {
        subscriptionId,
        planId,
        periodStart,
        periodEnd,
        tripsLimit,
      },
    });
  }

  async updateOpenPeriod(data: OpenPeriodUpdate) {
    const { subscriptionId, planId, tripsLimit } = data;
    const period = await this.prisma.subscriptionPeriod.findFirst({
      where: {
        subscriptionId,
        periodStart: { lte: new Date() },
        periodEnd: { gte: new Date() },
      },
      orderBy: { periodStart: "desc" },
    });
    if (!period) {
      return null;
    }
    return this.prisma.subscriptionPeriod.update({
      where: { id: period.id },
      data: { planId, tripsLimit },
    });
  }

  listPeriodEnded(query: NowQuery) {
    const { now } = query;
    return this.prisma.subscription.findMany({
      where: {
        OR: [
          {
            status: SubscriptionStatus.ACTIVE,
            currentPeriodEnd: { not: null, lte: now },
          },
          {
            status: SubscriptionStatus.TRIALING,
            OR: [
              { trialEnd: { not: null, lte: now } },
              { currentPeriodEnd: { not: null, lte: now } },
            ],
          },
        ],
      },
      include: { plan: true, pendingPlan: true },
    });
  }

  listPastDue(query: NowQuery) {
    const { now } = query;
    return this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.PAST_DUE,
        currentPeriodEnd: { not: null, lte: now },
      },
      include: { plan: true, pendingPlan: true },
    });
  }

  listTrialEnding(query: TrialEndingQuery) {
    const { from, to } = query;
    return this.prisma.subscription.findMany({
      where: {
        status: SubscriptionStatus.TRIALING,
        trialEnd: { gte: from, lte: to },
      },
      include: { plan: true, pendingPlan: true },
    });
  }

  async incrementTrips(query: IdQuery) {
    const { id } = query;
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.subscription.update({
        where: { id },
        data: { tripsUsed: { increment: 1 } },
        include: { plan: true, pendingPlan: true },
      });
      const period = await tx.subscriptionPeriod.findFirst({
        where: {
          subscriptionId: id,
          periodStart: { lte: new Date() },
          periodEnd: { gte: new Date() },
        },
        orderBy: { periodStart: "desc" },
      });
      if (period) {
        await tx.subscriptionPeriod.update({
          where: { id: period.id },
          data: { tripsUsed: { increment: 1 } },
        });
      }
      return updated;
    });
  }
}
