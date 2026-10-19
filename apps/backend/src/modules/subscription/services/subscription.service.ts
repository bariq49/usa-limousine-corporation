import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  Audience,
  NotificationType,
  PaymentStatus,
  Prisma,
  SubscriptionStatus,
} from "@prisma/client";
import { AppLogger } from "../../../common/logger/app.logger";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { NotificationService } from "../../notification/services/notification.service";
import { ChargeService } from "../../payment/services/charge.service";
import {
  DUNNING_MAX_ATTEMPTS,
  DUNNING_RETRY_INTERVAL_MS,
  STALE_PENDING_PAYMENT_MS,
  TRIAL_ENDING_LEAD_MS,
} from "../constants/constants";
import { PlanRepository } from "../repositories/plan.repository";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import type { AttachPaymentMethod, OffSessionRenew, Start, Upgrade } from "../types/subscription";
import type { StartResult } from "../types/start-result";
import { addCalendarDays, addCalendarMonths, addPlanInterval } from "../utils/calendar";
import { toAmount } from "../../../common/utils/money";
import { isPlanDowngrade, isPlanUpgrade, proratedUpgradeCharge } from "../utils/plan";
import { purposeFor } from "../utils/purpose";
import { recipientFor } from "../utils/recipient";

@Injectable()
export class SubscriptionService {
  constructor(
    @Inject(SubscriptionRepository) private readonly subscriptions: SubscriptionRepository,
    @Inject(PlanRepository) private readonly plans: PlanRepository,
    @Inject(NotificationService) private readonly notifications: NotificationService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ChargeService) private readonly charges: ChargeService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  listPlans(audience: Audience) {
    return this.plans.listActive(audience);
  }

  getMine(audience: Audience, referenceId: string) {
    return this.subscriptions.findCurrentByOwner({ audience, referenceId });
  }

  async start(params: Start): Promise<StartResult> {
    const { audience, owner, planId } = params;
    const { referenceId, freeUsedAt } = owner;

    const plan = await this.plans.findById(planId);
    if (!plan || !plan.isActive || plan.audience !== audience) {
      throw new NotFoundException("Subscription plan not found");
    }

    const existing = await this.subscriptions.findCurrentByOwner({ audience, referenceId });
    if (
      existing &&
      existing.status !== SubscriptionStatus.INCOMPLETE &&
      existing.status !== SubscriptionStatus.PAST_DUE
    ) {
      throw new ConflictException("Already has an active subscription");
    }

    const amount = toAmount(plan.amount);
    const freeEligible = freeUsedAt == null && (plan.freeMonths > 0 || plan.freeDays > 0);
    const purpose = purposeFor(audience);
    const description = `${plan.name} subscription`;
    const recipientType = recipientFor(audience);

    if (freeEligible) {
      const now = new Date();
      const trialEnd =
        plan.freeMonths > 0
          ? addCalendarMonths(now, plan.freeMonths)
          : addCalendarDays(now, plan.freeDays);

      const reusable =
        existing?.status === SubscriptionStatus.INCOMPLETE ||
        existing?.status === SubscriptionStatus.PAST_DUE;

      const sub = reusable
        ? await this.subscriptions.update({
            id: existing.id,
            data: {
              plan: { connect: { id: plan.id } },
              status: SubscriptionStatus.INCOMPLETE,
              trialEnd,
              currentPeriodStart: null,
              currentPeriodEnd: null,
              tripsUsed: 0,
              cancelAtPeriodEnd: false,
              pendingPlan: { disconnect: true },
              pendingChargeAmount: null,
            },
          })
        : await this.subscriptions.create({
            planId: plan.id,
            audience,
            referenceId,
            status: SubscriptionStatus.INCOMPLETE,
          });

      if (!reusable) {
        await this.subscriptions.update({
          id: sub.id,
          data: { trialEnd },
        });
      }

      return {
        purpose,
        subscriptionId: sub.id,
        referenceId: sub.id,
        amount: 0,
        description,
        checkoutRequired: true,
        isTrialCheckout: true,
        freeUsedAt: null,
      };
    }

    if (amount === 0) {
      const now = new Date();
      const periodEnd = addPlanInterval(now, plan.interval);

      const reusable =
        existing?.status === SubscriptionStatus.INCOMPLETE ||
        existing?.status === SubscriptionStatus.PAST_DUE;

      const sub = reusable
        ? await this.subscriptions.update({
            id: existing.id,
            data: {
              plan: { connect: { id: plan.id } },
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
              trialEnd: null,
              tripsUsed: 0,
              cancelAtPeriodEnd: false,
              pendingPlan: { disconnect: true },
              pendingChargeAmount: null,
            },
          })
        : await this.subscriptions.create({
            planId: plan.id,
            audience,
            referenceId,
            status: SubscriptionStatus.ACTIVE,
          });

      if (!reusable) {
        await this.subscriptions.update({
          id: sub.id,
          data: {
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            tripsUsed: 0,
          },
        });
      }

      const updated = await this.subscriptions.findById({ id: sub.id });
      if (!updated) {
        throw new NotFoundException("Subscription not found");
      }

      await this.subscriptions.createPeriod({
        subscriptionId: sub.id,
        planId: plan.id,
        periodStart: now,
        periodEnd,
        tripsLimit: plan.tripsPerMonth,
      });
      await this.subscriptions.createEvent({ subscriptionId: sub.id, type: "activated_local" });
      await this.notifications.notify({
        recipientType,
        recipientId: referenceId,
        type: NotificationType.SUBSCRIPTION_ACTIVATED,
        title: "Subscription activated",
        body: "Your subscription is active.",
        data: { subscriptionId: sub.id },
        push: true,
      });

      return {
        purpose,
        subscriptionId: sub.id,
        referenceId: sub.id,
        amount: 0,
        description,
        subscription: updated,
        checkoutRequired: false,
        freeUsedAt: null,
      };
    }

    const reusable =
      existing?.status === SubscriptionStatus.INCOMPLETE ||
      existing?.status === SubscriptionStatus.PAST_DUE;

    let sub;
    if (reusable) {
      sub = await this.subscriptions.update({
        id: existing.id,
        data: { plan: { connect: { id: plan.id } } },
      });
    } else {
      try {
        sub = await this.subscriptions.create({
          planId: plan.id,
          audience,
          referenceId,
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          throw new ConflictException("Already has an active subscription");
        }
        throw error;
      }
    }

    return {
      purpose,
      subscriptionId: sub.id,
      referenceId: sub.id,
      amount,
      description,
      checkoutRequired: true,
      freeUsedAt: null,
    };
  }

  async renew(params: Start) {
    const existing = await this.subscriptions.findCurrentByOwner({
      audience: params.audience,
      referenceId: params.owner.referenceId,
    });
    if (!existing || existing.status !== SubscriptionStatus.PAST_DUE) {
      throw new BadRequestException("No past-due subscription to renew");
    }
    return this.start({
      audience: params.audience,
      owner: params.owner,
      planId: params.planId,
    });
  }

  async upgrade(params: Upgrade) {
    const { audience, referenceId, planId } = params;
    const existing = await this.subscriptions.findCurrentByOwner({ audience, referenceId });
    if (
      !existing ||
      (existing.status !== SubscriptionStatus.TRIALING &&
        existing.status !== SubscriptionStatus.ACTIVE)
    ) {
      throw new BadRequestException("No active subscription to upgrade");
    }
    if (existing.planId === planId) {
      throw new BadRequestException("Already on this plan");
    }

    const nextPlan = await this.plans.findById(planId);
    if (!nextPlan || !nextPlan.isActive || nextPlan.audience !== audience) {
      throw new NotFoundException("Subscription plan not found");
    }
    if (!isPlanUpgrade(existing.plan, nextPlan)) {
      throw new BadRequestException("Only plan upgrades are allowed");
    }

    const purpose = purposeFor(audience);
    const description = `Upgrade to ${nextPlan.name}`;
    const currentAmount = toAmount(existing.plan.amount);
    const nextAmount = toAmount(nextPlan.amount);
    const charge = proratedUpgradeCharge({
      currentAmount,
      nextAmount,
      periodStart: existing.currentPeriodStart,
      periodEnd: existing.currentPeriodEnd,
    });

    if (charge === 0) {
      const claimed = await this.prisma.subscription.updateMany({
        where: {
          id: existing.id,
          status: { in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE] },
          planId: existing.planId,
        },
        data: {
          planId: nextPlan.id,
          pendingPlanId: null,
          pendingChargeAmount: null,
          cancelAtPeriodEnd: false,
        },
      });
      if (claimed.count === 0) {
        throw new ConflictException("Subscription changed; retry upgrade");
      }
      const updated = await this.subscriptions.findById({ id: existing.id });
      await this.subscriptions.updateOpenPeriod({
        subscriptionId: existing.id,
        planId: nextPlan.id,
        tripsLimit: nextPlan.tripsPerMonth,
      });
      await this.subscriptions.createEvent({
        subscriptionId: existing.id,
        type: "upgraded_local",
        payload: {
          fromPlanId: existing.planId,
          toPlanId: nextPlan.id,
          charge: 0,
        },
      });
      await this.notifications.notify({
        recipientType: recipientFor(audience),
        recipientId: referenceId,
        type: NotificationType.SUBSCRIPTION_PLAN_CHANGED,
        title: "Plan upgraded",
        body: `Your plan is now ${nextPlan.name}.`,
        data: { subscriptionId: existing.id },
        push: true,
      });
      return {
        purpose,
        subscriptionId: existing.id,
        referenceId: existing.id,
        amount: 0,
        description,
        subscription: updated,
        checkoutRequired: false as const,
        freeUsedAt: null,
      };
    }

    const claimed = await this.prisma.subscription.updateMany({
      where: {
        id: existing.id,
        status: { in: [SubscriptionStatus.TRIALING, SubscriptionStatus.ACTIVE] },
      },
      data: {
        pendingPlanId: nextPlan.id,
        pendingChargeAmount: charge,
        cancelAtPeriodEnd: false,
      },
    });
    if (claimed.count === 0) {
      throw new ConflictException("Subscription changed; retry upgrade");
    }

    const updated = await this.subscriptions.findById({ id: existing.id });

    await this.subscriptions.createEvent({
      subscriptionId: existing.id,
      type: "upgrade_checkout_prepared",
      payload: {
        fromPlanId: existing.planId,
        toPlanId: nextPlan.id,
        charge,
      },
    });

    return {
      purpose,
      subscriptionId: existing.id,
      referenceId: existing.id,
      amount: charge,
      description,
      subscription: updated,
      checkoutRequired: true as const,
      freeUsedAt: null,
    };
  }

  async downgrade(params: Upgrade) {
    const { audience, referenceId, planId } = params;
    const existing = await this.subscriptions.findCurrentByOwner({ audience, referenceId });
    if (
      !existing ||
      (existing.status !== SubscriptionStatus.TRIALING &&
        existing.status !== SubscriptionStatus.ACTIVE)
    ) {
      throw new BadRequestException("No active subscription to downgrade");
    }
    if (existing.planId === planId) {
      throw new BadRequestException("Already on this plan");
    }

    const nextPlan = await this.plans.findById(planId);
    if (!nextPlan || !nextPlan.isActive || nextPlan.audience !== audience) {
      throw new NotFoundException("Subscription plan not found");
    }
    if (!isPlanDowngrade(existing.plan, nextPlan)) {
      throw new BadRequestException("Only plan downgrades are allowed");
    }

    const purpose = purposeFor(audience);
    const description = `Downgrade to ${nextPlan.name}`;

    const updated = await this.subscriptions.update({
      id: existing.id,
      data: {
        pendingPlan: { connect: { id: nextPlan.id } },
        pendingChargeAmount: 0,
        cancelAtPeriodEnd: false,
      },
    });

    await this.subscriptions.createEvent({
      subscriptionId: existing.id,
      type: "downgrade_scheduled",
      payload: {
        fromPlanId: existing.planId,
        toPlanId: nextPlan.id,
      },
    });
    await this.notifications.notify({
      recipientType: recipientFor(audience),
      recipientId: referenceId,
      type: NotificationType.SUBSCRIPTION_PLAN_CHANGED,
      title: "Plan change scheduled",
      body: `Your plan will change to ${nextPlan.name} at the end of the current period.`,
      data: { subscriptionId: existing.id },
      push: true,
    });

    return {
      purpose,
      subscriptionId: existing.id,
      referenceId: existing.id,
      amount: 0,
      description,
      subscription: updated,
      checkoutRequired: false as const,
      freeUsedAt: null,
    };
  }

  async cancel(audience: Audience, referenceId: string) {
    const sub = await this.subscriptions.findCurrentByOwner({ audience, referenceId });
    if (
      !sub ||
      (sub.status !== SubscriptionStatus.TRIALING &&
        sub.status !== SubscriptionStatus.ACTIVE &&
        sub.status !== SubscriptionStatus.PAST_DUE)
    ) {
      throw new NotFoundException("No cancelable subscription found");
    }
    if (sub.cancelAtPeriodEnd) {
      return sub;
    }

    const updated = await this.subscriptions.update({
      id: sub.id,
      data: { cancelAtPeriodEnd: true },
    });
    await this.subscriptions.createEvent({
      subscriptionId: sub.id,
      type: "cancel_at_period_end",
    });
    await this.notifications.notify({
      recipientType: recipientFor(audience),
      recipientId: referenceId,
      type: NotificationType.SUBSCRIPTION_CANCEL_SCHEDULED,
      title: "Subscription cancellation scheduled",
      body: "Your subscription will end at the close of the current period.",
      data: { subscriptionId: sub.id },
      push: true,
    });
    return updated;
  }

  async resume(audience: Audience, referenceId: string) {
    const sub = await this.subscriptions.findCurrentByOwner({ audience, referenceId });
    if (
      !sub ||
      !sub.cancelAtPeriodEnd ||
      (sub.status !== SubscriptionStatus.TRIALING &&
        sub.status !== SubscriptionStatus.ACTIVE &&
        sub.status !== SubscriptionStatus.PAST_DUE)
    ) {
      throw new BadRequestException("No resumable subscription found");
    }

    const updated = await this.subscriptions.update({
      id: sub.id,
      data: { cancelAtPeriodEnd: false },
    });
    await this.subscriptions.createEvent({
      subscriptionId: sub.id,
      type: "resume",
    });
    await this.notifications.notify({
      recipientType: recipientFor(audience),
      recipientId: referenceId,
      type: NotificationType.SUBSCRIPTION_RESUMED,
      title: "Subscription resumed",
      body: "Your subscription will renew automatically.",
      data: { subscriptionId: sub.id },
      push: true,
    });
    return updated;
  }

  async attachPaymentMethod(subscriptionId: string, method: AttachPaymentMethod) {
    const sub = await this.subscriptions.findById({ id: subscriptionId });
    if (!sub) {
      return;
    }

    const data: {
      stripeCustomerId?: string | null;
      stripePaymentMethodId?: string | null;
    } = {};
    if (method.customerId !== undefined) {
      data.stripeCustomerId = method.customerId;
    }
    if (method.paymentMethodId !== undefined) {
      data.stripePaymentMethodId = method.paymentMethodId;
    }
    if (Object.keys(data).length === 0) {
      return sub;
    }

    const updated = await this.subscriptions.update({
      id: subscriptionId,
      data,
    });

    if (sub.audience === Audience.DRIVER && method.customerId) {
      await this.prisma.driver.updateMany({
        where: { id: sub.referenceId, stripeCustomerId: null },
        data: { stripeCustomerId: method.customerId },
      });
    }

    return updated;
  }

  async activateTrialAfterSetup(subscriptionId: string) {
    const sub = await this.subscriptions.findById({ id: subscriptionId });
    if (!sub || sub.status !== SubscriptionStatus.INCOMPLETE || !sub.trialEnd) {
      return sub;
    }

    const now = new Date();
    const periodEnd = sub.trialEnd;
    const claimed = await this.prisma.subscription.updateMany({
      where: { id: sub.id, status: SubscriptionStatus.INCOMPLETE },
      data: {
        status: SubscriptionStatus.TRIALING,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        tripsUsed: 0,
        cancelAtPeriodEnd: false,
      },
    });
    if (claimed.count === 0) {
      return this.subscriptions.findById({ id: sub.id });
    }

    await this.subscriptions.createPeriod({
      subscriptionId: sub.id,
      planId: sub.planId,
      periodStart: now,
      periodEnd,
      tripsLimit: sub.plan.tripsPerMonth,
    });
    await this.subscriptions.createEvent({
      subscriptionId: sub.id,
      type: "trial_started",
    });
    await this.notifications.notify({
      recipientType: recipientFor(sub.audience),
      recipientId: sub.referenceId,
      type: NotificationType.SUBSCRIPTION_ACTIVATED,
      title: "Trial started",
      body: "Your free trial is active.",
      data: { subscriptionId: sub.id },
      push: true,
    });

    if (sub.audience === Audience.DRIVER) {
      await this.prisma.driver.updateMany({
        where: { id: sub.referenceId, subscriptionFreeUsedAt: null },
        data: { subscriptionFreeUsedAt: now },
      });
    }

    return this.subscriptions.findById({ id: sub.id });
  }

  async assertCanAcceptTrip(audience: Audience, referenceId: string) {
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: "global" },
      select: { requireSubscription: true },
    });
    if (!settings?.requireSubscription) {
      return null;
    }

    const sub = await this.subscriptions.findCurrentByOwner({ audience, referenceId });
    if (!sub) {
      throw new ForbiddenException("An active subscription is required to accept trips");
    }
    if (
      sub.status === SubscriptionStatus.INCOMPLETE ||
      sub.status === SubscriptionStatus.CANCELED ||
      sub.status === SubscriptionStatus.EXPIRED
    ) {
      throw new ForbiddenException("Subscription is not active");
    }

    const now = new Date();
    if (sub.status === SubscriptionStatus.PAST_DUE) {
      const graceEnd = sub.currentPeriodEnd
        ? new Date(sub.currentPeriodEnd.getTime() + sub.plan.graceDays * 24 * 60 * 60 * 1000)
        : null;
      if (!graceEnd || now > graceEnd) {
        throw new ForbiddenException("Subscription payment is past due");
      }
    }

    if (sub.plan.tripsPerMonth != null && sub.tripsUsed >= sub.plan.tripsPerMonth) {
      throw new ForbiddenException("Monthly trip limit reached for your subscription plan");
    }

    return sub;
  }

  async recordTripUse(audience: Audience, referenceId: string) {
    const sub = await this.subscriptions.findCurrentByOwner({ audience, referenceId });
    if (!sub) {
      return;
    }
    await this.subscriptions.incrementTrips({ id: sub.id });
  }

  async onPaid(subscriptionId: string) {
    const sub = await this.subscriptions.findById({ id: subscriptionId });
    if (!sub) {
      return;
    }

    if (sub.pendingPlanId) {
      const fromPlanId = sub.planId;
      const toPlanId = sub.pendingPlanId;
      const nextPlan = sub.pendingPlan ?? (await this.plans.findById(toPlanId));
      if (!nextPlan) {
        throw new NotFoundException("Pending upgrade plan not found");
      }

      const charge = sub.pendingChargeAmount != null ? toAmount(sub.pendingChargeAmount) : null;
      const claimed = await this.prisma.subscription.updateMany({
        where: { id: sub.id, pendingPlanId: toPlanId },
        data: {
          planId: toPlanId,
          pendingPlanId: null,
          pendingChargeAmount: null,
          cancelAtPeriodEnd: false,
        },
      });
      if (claimed.count === 0) {
        return this.subscriptions.findById({ id: sub.id });
      }

      await this.subscriptions.updateOpenPeriod({
        subscriptionId: sub.id,
        planId: toPlanId,
        tripsLimit: nextPlan.tripsPerMonth,
      });
      await this.subscriptions.createEvent({
        subscriptionId: sub.id,
        type: "upgraded_paid",
        payload: {
          fromPlanId,
          toPlanId,
          charge,
        },
      });
      await this.notifications.notify({
        recipientType: recipientFor(sub.audience),
        recipientId: sub.referenceId,
        type: NotificationType.SUBSCRIPTION_PLAN_CHANGED,
        title: "Plan upgraded",
        body: `Your plan is now ${nextPlan.name}.`,
        data: { subscriptionId: sub.id },
        push: true,
      });
      return this.subscriptions.findById({ id: sub.id });
    }

    if (sub.status === SubscriptionStatus.INCOMPLETE) {
      const now = new Date();
      const periodEnd = sub.trialEnd ?? addPlanInterval(now, sub.plan.interval);
      const status = sub.trialEnd ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE;
      const claimed = await this.prisma.subscription.updateMany({
        where: { id: sub.id, status: SubscriptionStatus.INCOMPLETE },
        data: {
          status,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          tripsUsed: 0,
          cancelAtPeriodEnd: false,
        },
      });
      if (claimed.count === 0) {
        return this.subscriptions.findById({ id: sub.id });
      }

      await this.subscriptions.createPeriod({
        subscriptionId: sub.id,
        planId: sub.planId,
        periodStart: now,
        periodEnd,
        tripsLimit: sub.plan.tripsPerMonth,
      });
      await this.subscriptions.createEvent({
        subscriptionId: sub.id,
        type: "activated_paid",
      });

      if (sub.trialEnd && sub.audience === Audience.DRIVER) {
        await this.prisma.driver.updateMany({
          where: { id: sub.referenceId, subscriptionFreeUsedAt: null },
          data: { subscriptionFreeUsedAt: now },
        });
      }

      await this.notifications.notify({
        recipientType: recipientFor(sub.audience),
        recipientId: sub.referenceId,
        type: NotificationType.SUBSCRIPTION_ACTIVATED,
        title: "Subscription activated",
        body: "Your subscription is active.",
        data: { subscriptionId: sub.id },
        push: true,
      });
      return this.subscriptions.findById({ id: sub.id });
    }

    if (sub.status === SubscriptionStatus.PAST_DUE) {
      const now = new Date();
      const periodEnd = addPlanInterval(now, sub.plan.interval);
      // Claim renew once (local onPaid + async payment.succeeded can race).
      const claimed = await this.prisma.subscription.updateMany({
        where: { id: sub.id, status: SubscriptionStatus.PAST_DUE },
        data: {
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          trialEnd: null,
          tripsUsed: 0,
          cancelAtPeriodEnd: false,
          dunningAttempts: 0,
          lastDunningAt: null,
        },
      });
      if (claimed.count === 0) {
        return this.subscriptions.findById({ id: sub.id });
      }

      await this.subscriptions.createPeriod({
        subscriptionId: sub.id,
        planId: sub.planId,
        periodStart: now,
        periodEnd,
        tripsLimit: sub.plan.tripsPerMonth,
      });
      await this.subscriptions.createEvent({
        subscriptionId: sub.id,
        type: "period_rolled",
      });
      await this.subscriptions.createEvent({
        subscriptionId: sub.id,
        type: "renewed_paid",
      });
      await this.notifications.notify({
        recipientType: recipientFor(sub.audience),
        recipientId: sub.referenceId,
        type: NotificationType.SUBSCRIPTION_ACTIVATED,
        title: "Subscription renewed",
        body: "Your subscription has been renewed.",
        data: { subscriptionId: sub.id },
        push: true,
      });
      return this.subscriptions.findById({ id: sub.id });
    }
  }

  async closeEndedPeriods(now: Date = new Date()) {
    const rows = await this.subscriptions.listPeriodEnded({ now });
    for (const sub of rows) {
      let plan = sub.plan;
      let planId = sub.planId;
      const pendingCharge = toAmount(sub.pendingChargeAmount ?? 0);

      // Apply scheduled downgrades (charge 0). Drop abandoned upgrades so renew/onPaid
      // cannot apply an unpaid pending plan.
      if (sub.pendingPlanId && pendingCharge === 0) {
        const nextPlan = sub.pendingPlan ?? (await this.plans.findById(sub.pendingPlanId));
        if (nextPlan) {
          await this.subscriptions.update({
            id: sub.id,
            data: {
              plan: { connect: { id: nextPlan.id } },
              pendingPlan: { disconnect: true },
              pendingChargeAmount: null,
            },
          });
          await this.subscriptions.updateOpenPeriod({
            subscriptionId: sub.id,
            planId: nextPlan.id,
            tripsLimit: nextPlan.tripsPerMonth,
          });
          await this.subscriptions.createEvent({
            subscriptionId: sub.id,
            type: "downgrade_applied",
            payload: { fromPlanId: sub.planId, toPlanId: nextPlan.id },
          });
          plan = nextPlan;
          planId = nextPlan.id;
        }
      } else if (sub.pendingPlanId && pendingCharge > 0) {
        await this.subscriptions.update({
          id: sub.id,
          data: {
            pendingPlan: { disconnect: true },
            pendingChargeAmount: null,
          },
        });
        await this.subscriptions.createEvent({
          subscriptionId: sub.id,
          type: "pending_upgrade_cleared",
          payload: { pendingPlanId: sub.pendingPlanId, pendingCharge },
        });
      }

      if (sub.cancelAtPeriodEnd) {
        await this.subscriptions.update({
          id: sub.id,
          data: {
            status: SubscriptionStatus.CANCELED,
            cancelAtPeriodEnd: false,
          },
        });
        await this.subscriptions.createEvent({
          subscriptionId: sub.id,
          type: "canceled_at_period_end",
        });
        await this.notifications.notify({
          recipientType: recipientFor(sub.audience),
          recipientId: sub.referenceId,
          type: NotificationType.SUBSCRIPTION_EXPIRED,
          title: "Subscription ended",
          body: "Your subscription has ended as scheduled.",
          data: { subscriptionId: sub.id },
          push: true,
        });
        continue;
      }

      const amount = toAmount(plan.amount);
      if (amount === 0) {
        const periodEnd = addPlanInterval(now, plan.interval);
        await this.subscriptions.update({
          id: sub.id,
          data: {
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
            trialEnd: null,
            tripsUsed: 0,
            cancelAtPeriodEnd: false,
          },
        });
        await this.subscriptions.createPeriod({
          subscriptionId: sub.id,
          planId,
          periodStart: now,
          periodEnd,
          tripsLimit: plan.tripsPerMonth,
        });
        await this.subscriptions.createEvent({
          subscriptionId: sub.id,
          type: "period_rolled",
        });
        continue;
      }

      await this.subscriptions.update({
        id: sub.id,
        data: { status: SubscriptionStatus.PAST_DUE },
      });
      await this.subscriptions.createEvent({
        subscriptionId: sub.id,
        type: "renewal_due",
      });

      if (sub.stripeCustomerId && sub.stripePaymentMethodId) {
        const renewed = await this.attemptOffSessionRenew({
          id: sub.id,
          audience: sub.audience,
          referenceId: sub.referenceId,
          stripeCustomerId: sub.stripeCustomerId,
          stripePaymentMethodId: sub.stripePaymentMethodId,
          dunningAttempts: 0,
          plan,
          now,
        });
        if (renewed) {
          continue;
        }
      }

      await this.notifications.notify({
        recipientType: recipientFor(sub.audience),
        recipientId: sub.referenceId,
        type: NotificationType.SUBSCRIPTION_PAST_DUE,
        title: "Subscription renewal required",
        body: "Your billing period ended. We will retry payment during the grace period, or renew manually to keep access.",
        data: { subscriptionId: sub.id },
        push: true,
      });
    }
  }

  async retryPastDueCharges(now: Date = new Date()) {
    const rows = await this.subscriptions.listPastDue({ now });
    for (const sub of rows) {
      if (!sub.currentPeriodEnd || !sub.stripeCustomerId || !sub.stripePaymentMethodId) {
        continue;
      }

      const graceEnd = new Date(
        sub.currentPeriodEnd.getTime() + sub.plan.graceDays * 24 * 60 * 60 * 1000,
      );
      if (now > graceEnd) {
        continue;
      }
      if (sub.dunningAttempts >= DUNNING_MAX_ATTEMPTS) {
        continue;
      }
      if (
        sub.lastDunningAt &&
        now.getTime() - sub.lastDunningAt.getTime() < DUNNING_RETRY_INTERVAL_MS
      ) {
        continue;
      }

      await this.attemptOffSessionRenew({
        id: sub.id,
        audience: sub.audience,
        referenceId: sub.referenceId,
        stripeCustomerId: sub.stripeCustomerId,
        stripePaymentMethodId: sub.stripePaymentMethodId,
        dunningAttempts: sub.dunningAttempts,
        plan: sub.plan,
        now,
      });
    }
  }

  private async attemptOffSessionRenew(params: OffSessionRenew): Promise<boolean> {
    const attempt = params.dunningAttempts + 1;
    const amount = toAmount(params.plan.amount);
    const purpose = purposeFor(params.audience);
    await this.subscriptions.update({
      id: params.id,
      data: {
        dunningAttempts: attempt,
        lastDunningAt: params.now,
      },
    });
    await this.subscriptions.createEvent({
      subscriptionId: params.id,
      type: "dunning_attempt",
      payload: { attempt, maxAttempts: DUNNING_MAX_ATTEMPTS },
    });

    const charged = await this.charges.tryOffSession({
      purpose,
      referenceId: params.id,
      amount,
      description: `${params.plan.name} subscription renew`,
      customerId: params.stripeCustomerId,
      paymentMethodId: params.stripePaymentMethodId,
      metadata: { subscriptionId: params.id },
    });

    if (charged.ok) {
      await this.onPaid(params.id);
      return true;
    }

    const isFinal = attempt >= DUNNING_MAX_ATTEMPTS;
    await this.subscriptions.createEvent({
      subscriptionId: params.id,
      type: "dunning_failed",
      payload: { attempt, maxAttempts: DUNNING_MAX_ATTEMPTS, final: isFinal },
    });
    await this.notifications.notify({
      recipientType: recipientFor(params.audience),
      recipientId: params.referenceId,
      type: NotificationType.SUBSCRIPTION_PAYMENT_FAILED,
      title: isFinal ? "Final renewal attempt failed" : "Payment failed",
      body: isFinal
        ? "We could not renew your subscription after several attempts. Update your payment method or renew manually before the grace period ends."
        : `We could not renew your subscription (attempt ${attempt} of ${DUNNING_MAX_ATTEMPTS}). We will retry, or you can renew manually.`,
      data: {
        subscriptionId: params.id,
        attempt,
        maxAttempts: DUNNING_MAX_ATTEMPTS,
        final: isFinal,
      },
      push: true,
    });
    return false;
  }

  async notifyTrialEnding(now: Date = new Date()) {
    const until = new Date(now.getTime() + TRIAL_ENDING_LEAD_MS);
    const rows = await this.subscriptions.listTrialEnding({ from: now, to: until });
    for (const sub of rows) {
      await this.notifications.notify({
        recipientType: recipientFor(sub.audience),
        recipientId: sub.referenceId,
        type: NotificationType.SUBSCRIPTION_TRIAL_ENDING,
        title: "Trial ending soon",
        body: "Your free trial ends in a few days.",
        data: { subscriptionId: sub.id },
        push: true,
      });
    }
  }

  async expirePastDue(now: Date = new Date()) {
    const rows = await this.subscriptions.listPastDue({ now });
    for (const sub of rows) {
      const graceEnd = sub.currentPeriodEnd
        ? new Date(sub.currentPeriodEnd.getTime() + sub.plan.graceDays * 24 * 60 * 60 * 1000)
        : null;
      if (!graceEnd || now <= graceEnd) {
        continue;
      }

      await this.subscriptions.update({
        id: sub.id,
        data: {
          status: SubscriptionStatus.EXPIRED,
          cancelAtPeriodEnd: false,
          pendingPlan: { disconnect: true },
          pendingChargeAmount: null,
          dunningAttempts: 0,
          lastDunningAt: null,
        },
      });
      await this.subscriptions.createEvent({
        subscriptionId: sub.id,
        type: "expired_after_grace",
      });

      await this.notifications.notify({
        recipientType: recipientFor(sub.audience),
        recipientId: sub.referenceId,
        type: NotificationType.SUBSCRIPTION_EXPIRED,
        title: "Subscription expired",
        body: "Your subscription expired after the grace period.",
        data: { subscriptionId: sub.id },
        push: true,
      });
    }
  }

  async reconcileBilling(now: Date = new Date()) {
    const purposes = [purposeFor(Audience.DRIVER), purposeFor(Audience.AGENCY)] as const;

    const succeeded = await this.prisma.payment.findMany({
      where: {
        purpose: { in: [...purposes] },
        status: PaymentStatus.SUCCEEDED,
        updatedAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });

    let repaired = 0;
    let orphanPayments = 0;
    for (const payment of succeeded) {
      const sub = await this.subscriptions.findById({ id: payment.referenceId });
      if (!sub) {
        orphanPayments += 1;
        continue;
      }

      const needsApply =
        sub.status === SubscriptionStatus.INCOMPLETE ||
        sub.status === SubscriptionStatus.PAST_DUE ||
        Boolean(sub.pendingPlanId);
      if (!needsApply) {
        continue;
      }

      await this.onPaid(sub.id);
      repaired += 1;
    }

    const stalePending = await this.prisma.payment.count({
      where: {
        purpose: { in: [...purposes] },
        status: PaymentStatus.PENDING,
        updatedAt: { lte: new Date(now.getTime() - STALE_PENDING_PAYMENT_MS) },
      },
    });

    let pastGrace = 0;
    const pastDue = await this.subscriptions.listPastDue({ now });
    for (const sub of pastDue) {
      if (!sub.currentPeriodEnd) {
        continue;
      }
      const graceEnd = new Date(
        sub.currentPeriodEnd.getTime() + sub.plan.graceDays * 24 * 60 * 60 * 1000,
      );
      if (now > graceEnd) {
        pastGrace += 1;
      }
    }

    if (repaired > 0 || orphanPayments > 0 || stalePending > 0 || pastGrace > 0) {
      this.logger.warn(
        `Reconcile: repaired=${repaired} orphanPayments=${orphanPayments} stalePending=${stalePending} pastGrace=${pastGrace}`,
        SubscriptionService.name,
      );
    }
  }
}
