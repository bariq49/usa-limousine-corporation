import { ForbiddenException } from "@nestjs/common";
import { Audience, SubscriptionInterval, SubscriptionStatus } from "@prisma/client";
import {
  addCalendarMonths,
  addPlanInterval,
  daysLeftUntil,
  intervalMonths,
} from "../src/modules/subscription/utils/calendar";
import {
  isPlanDowngrade,
  isPlanUpgrade,
  proratedUpgradeCharge,
} from "../src/modules/subscription/utils/plan";

describe("subscription calendar utils", () => {
  it("adds exact calendar months in Europe/Amsterdam (not days*30)", () => {
    const from = new Date("2026-01-31T11:00:00.000Z");
    const next = addCalendarMonths(from, 1);
    expect(next.toISOString()).toBe("2026-02-28T11:00:00.000Z");

    const fromMarch = new Date("2026-03-15T11:00:00.000Z");
    expect(addCalendarMonths(fromMarch, 2).toISOString()).toBe("2026-05-15T10:00:00.000Z");
  });

  it("computes calendar days left in Europe/Amsterdam", () => {
    const now = new Date("2026-08-27T22:30:00.000Z");
    const end = new Date("2026-08-29T10:00:00.000Z");
    expect(daysLeftUntil(end, now)).toBe(1);
    expect(daysLeftUntil(null, now)).toBeNull();
    expect(daysLeftUntil(new Date("2026-08-20T00:00:00.000Z"), now)).toBe(0);
  });

  it("maps YEAR interval to 12 calendar months", () => {
    expect(intervalMonths(SubscriptionInterval.MONTH)).toBe(1);
    expect(intervalMonths(SubscriptionInterval.YEAR)).toBe(12);
    const from = new Date("2026-01-15T11:00:00.000Z");
    expect(addPlanInterval(from, SubscriptionInterval.YEAR).toISOString()).toBe(
      "2027-01-15T11:00:00.000Z",
    );
  });
});

describe("subscription plan upgrade utils", () => {
  it("detects price and trip upgrades", () => {
    expect(
      isPlanUpgrade({ amount: 10, tripsPerMonth: 20 }, { amount: 20, tripsPerMonth: 20 }),
    ).toBe(true);
    expect(
      isPlanUpgrade({ amount: 20, tripsPerMonth: 20 }, { amount: 20, tripsPerMonth: 40 }),
    ).toBe(true);
    expect(
      isPlanUpgrade({ amount: 20, tripsPerMonth: 40 }, { amount: 10, tripsPerMonth: 40 }),
    ).toBe(false);
  });

  it("detects plan downgrades", () => {
    expect(
      isPlanDowngrade({ amount: 20, tripsPerMonth: 40 }, { amount: 10, tripsPerMonth: 40 }),
    ).toBe(true);
    expect(
      isPlanDowngrade({ amount: 10, tripsPerMonth: 20 }, { amount: 20, tripsPerMonth: 20 }),
    ).toBe(false);
  });

  it("prorates upgrade charge by remaining period", () => {
    const charge = proratedUpgradeCharge({
      currentAmount: 10,
      nextAmount: 20,
      periodStart: new Date("2026-08-01T00:00:00.000Z"),
      periodEnd: new Date("2026-08-31T00:00:00.000Z"),
      now: new Date("2026-08-16T00:00:00.000Z"),
    });
    expect(charge).toBe(5);
  });
});

describe("SubscriptionService.assertCanAcceptTrip", () => {
  async function loadService(
    findCurrentByOwner: ReturnType<typeof jest.fn>,
    requireSubscription = true,
  ) {
    const { SubscriptionService } =
      await import("../src/modules/subscription/services/subscription.service");
    return new SubscriptionService(
      { findCurrentByOwner, incrementTrips: jest.fn() } as never,
      {} as never,
      { notify: jest.fn() } as never,
      {
        driver: { updateMany: jest.fn() },
        subscription: { updateMany: jest.fn() },
        platformSettings: {
          findUnique: jest.fn(async () => ({ requireSubscription })),
        },
      } as never,
      { tryOffSession: jest.fn() } as never,
      { warn: jest.fn(), log: jest.fn() } as never,
    );
  }

  it("skips subscription check when requireSubscription is false", async () => {
    const findCurrentByOwner = jest.fn();
    const service = await loadService(findCurrentByOwner, false);
    await expect(service.assertCanAcceptTrip(Audience.DRIVER, "drv1")).resolves.toBeNull();
    expect(findCurrentByOwner).not.toHaveBeenCalled();
  });

  it("allows ACTIVE within trip quota", async () => {
    const service = await loadService(
      jest.fn(async () => ({
        status: SubscriptionStatus.ACTIVE,
        tripsUsed: 1,
        currentPeriodEnd: new Date(Date.now() + 86_400_000),
        plan: { tripsPerMonth: 10, graceDays: 3 },
      })),
    );
    await expect(service.assertCanAcceptTrip(Audience.DRIVER, "drv1")).resolves.toBeTruthy();
  });

  it("rejects when quota is exhausted", async () => {
    const service = await loadService(
      jest.fn(async () => ({
        status: SubscriptionStatus.ACTIVE,
        tripsUsed: 10,
        currentPeriodEnd: new Date(Date.now() + 86_400_000),
        plan: { tripsPerMonth: 10, graceDays: 3 },
      })),
    );
    await expect(service.assertCanAcceptTrip(Audience.DRIVER, "drv1")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("rejects PAST_DUE after grace", async () => {
    const service = await loadService(
      jest.fn(async () => ({
        status: SubscriptionStatus.PAST_DUE,
        tripsUsed: 0,
        currentPeriodEnd: new Date(Date.now() - 10 * 86_400_000),
        plan: { tripsPerMonth: null, graceDays: 3 },
      })),
    );
    await expect(service.assertCanAcceptTrip(Audience.DRIVER, "drv1")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it("rejects when no subscription and requireSubscription is true", async () => {
    const service = await loadService(
      jest.fn(async () => null),
      true,
    );
    await expect(service.assertCanAcceptTrip(Audience.DRIVER, "drv1")).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});

describe("SubscriptionService billing lifecycle", () => {
  const day = 86_400_000;
  const now = new Date("2026-08-28T12:00:00.000Z");

  async function loadLifecycle(deps: {
    listPeriodEnded?: ReturnType<typeof jest.fn>;
    listPastDue?: ReturnType<typeof jest.fn>;
    update?: ReturnType<typeof jest.fn>;
    createEvent?: ReturnType<typeof jest.fn>;
    createPeriod?: ReturnType<typeof jest.fn>;
    findById?: ReturnType<typeof jest.fn>;
    notify?: ReturnType<typeof jest.fn>;
    tryOffSession?: ReturnType<typeof jest.fn>;
    updateMany?: ReturnType<typeof jest.fn>;
  }) {
    const { SubscriptionService } =
      await import("../src/modules/subscription/services/subscription.service");
    const notify = deps.notify ?? jest.fn();
    const tryOffSession = deps.tryOffSession ?? jest.fn(async () => ({ ok: false }));
    const update = deps.update ?? jest.fn(async ({ id }: { id: string }) => ({ id }));
    const createEvent = deps.createEvent ?? jest.fn();
    const createPeriod = deps.createPeriod ?? jest.fn();
    const findById = deps.findById ?? jest.fn();
    const updateMany = deps.updateMany ?? jest.fn(async () => ({ count: 1 }));

    const service = new SubscriptionService(
      {
        listPeriodEnded: deps.listPeriodEnded ?? jest.fn(async () => []),
        listPastDue: deps.listPastDue ?? jest.fn(async () => []),
        update,
        createEvent,
        createPeriod,
        findById,
        updateOpenPeriod: jest.fn(),
      } as never,
      { findById: jest.fn() } as never,
      { notify } as never,
      {
        driver: { updateMany: jest.fn() },
        subscription: { updateMany },
        payment: { findMany: jest.fn(async () => []) },
      } as never,
      { tryOffSession } as never,
      { warn: jest.fn(), log: jest.fn() } as never,
    );

    return { service, notify, tryOffSession, update, createEvent, createPeriod, updateMany };
  }

  it("marks PAST_DUE and notifies when paid plan ends without a card", async () => {
    const sub = {
      id: "sub1",
      audience: Audience.DRIVER,
      referenceId: "drv1",
      planId: "plan1",
      pendingPlanId: null,
      pendingChargeAmount: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
      stripePaymentMethodId: null,
      dunningAttempts: 0,
      lastDunningAt: null,
      plan: { name: "Pro", amount: { toString: () => "29" }, tripsPerMonth: 40, graceDays: 3 },
    };
    const { service, notify, update, createEvent } = await loadLifecycle({
      listPeriodEnded: jest.fn(async () => [sub]),
    });

    await service.closeEndedPeriods(now);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sub1",
        data: { status: SubscriptionStatus.PAST_DUE },
      }),
    );
    expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "renewal_due" }));
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "SUBSCRIPTION_PAST_DUE" }));
  });

  it("dunning-charges once at period end and notifies payment failed on decline", async () => {
    const sub = {
      id: "sub1",
      audience: Audience.DRIVER,
      referenceId: "drv1",
      planId: "plan1",
      pendingPlanId: null,
      pendingChargeAmount: null,
      cancelAtPeriodEnd: false,
      currentPeriodEnd: new Date(now.getTime() - day),
      stripeCustomerId: "cus_1",
      stripePaymentMethodId: "pm_1",
      dunningAttempts: 0,
      lastDunningAt: null,
      plan: { name: "Pro", amount: { toString: () => "29" }, tripsPerMonth: 40, graceDays: 3 },
    };
    const tryOffSession = jest.fn(async () => ({ ok: false }));
    const { service, notify, update, createEvent } = await loadLifecycle({
      listPeriodEnded: jest.fn(async () => [sub]),
      tryOffSession,
    });

    await service.closeEndedPeriods(now);

    expect(tryOffSession).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ dunningAttempts: 1 }),
      }),
    );
    expect(createEvent).toHaveBeenCalledWith(expect.objectContaining({ type: "dunning_failed" }));
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SUBSCRIPTION_PAYMENT_FAILED",
        data: expect.objectContaining({ attempt: 1, final: false }),
      }),
    );
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "SUBSCRIPTION_PAST_DUE" }));
  });

  it("retries PAST_DUE during grace when spacing elapsed", async () => {
    const sub = {
      id: "sub1",
      audience: Audience.DRIVER,
      referenceId: "drv1",
      currentPeriodEnd: new Date(now.getTime() - day),
      stripeCustomerId: "cus_1",
      stripePaymentMethodId: "pm_1",
      dunningAttempts: 1,
      lastDunningAt: new Date(now.getTime() - day),
      plan: { name: "Pro", amount: { toString: () => "29" }, graceDays: 3 },
    };
    const tryOffSession = jest.fn(async () => ({ ok: false }));
    const { service, notify } = await loadLifecycle({
      listPastDue: jest.fn(async () => [sub]),
      tryOffSession,
    });

    await service.retryPastDueCharges(now);

    expect(tryOffSession).toHaveBeenCalledTimes(1);
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "SUBSCRIPTION_PAYMENT_FAILED",
        data: expect.objectContaining({ attempt: 2, final: false }),
      }),
    );
  });

  it("skips dunning retry when interval has not elapsed", async () => {
    const sub = {
      id: "sub1",
      audience: Audience.DRIVER,
      referenceId: "drv1",
      currentPeriodEnd: new Date(now.getTime() - day),
      stripeCustomerId: "cus_1",
      stripePaymentMethodId: "pm_1",
      dunningAttempts: 1,
      lastDunningAt: new Date(now.getTime() - 60_000),
      plan: { name: "Pro", amount: { toString: () => "29" }, graceDays: 3 },
    };
    const tryOffSession = jest.fn(async () => ({ ok: false }));
    const { service } = await loadLifecycle({
      listPastDue: jest.fn(async () => [sub]),
      tryOffSession,
    });

    await service.retryPastDueCharges(now);
    expect(tryOffSession).not.toHaveBeenCalled();
  });

  it("expires PAST_DUE after grace and clears dunning state", async () => {
    const sub = {
      id: "sub1",
      audience: Audience.DRIVER,
      referenceId: "drv1",
      currentPeriodEnd: new Date(now.getTime() - 5 * day),
      plan: { graceDays: 3 },
    };
    const update = jest.fn(async ({ id }: { id: string }) => ({ id }));
    const { service, notify, createEvent } = await loadLifecycle({
      listPastDue: jest.fn(async () => [sub]),
      update,
    });

    await service.expirePastDue(now);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sub1",
        data: expect.objectContaining({
          status: SubscriptionStatus.EXPIRED,
          dunningAttempts: 0,
          lastDunningAt: null,
        }),
      }),
    );
    expect(createEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "expired_after_grace" }),
    );
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ type: "SUBSCRIPTION_EXPIRED" }));
  });

  it("cancels at period end when cancelAtPeriodEnd is set", async () => {
    const sub = {
      id: "sub1",
      audience: Audience.DRIVER,
      referenceId: "drv1",
      planId: "plan1",
      pendingPlanId: null,
      pendingChargeAmount: null,
      cancelAtPeriodEnd: true,
      plan: { name: "Pro", amount: { toString: () => "29" }, tripsPerMonth: 40, graceDays: 3 },
    };
    const { service, notify, update } = await loadLifecycle({
      listPeriodEnded: jest.fn(async () => [sub]),
    });

    await service.closeEndedPeriods(now);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: SubscriptionStatus.CANCELED }),
      }),
    );
    expect(notify).toHaveBeenCalledWith(
      expect.objectContaining({ type: "SUBSCRIPTION_EXPIRED", title: "Subscription ended" }),
    );
  });
});

describe("SubscriptionService.start trial checkout", () => {
  it("requires setup checkout for free trial instead of activating locally", async () => {
    const { SubscriptionService } =
      await import("../src/modules/subscription/services/subscription.service");
    const plan = {
      id: "plan1",
      audience: Audience.DRIVER,
      isActive: true,
      amount: 199,
      freeMonths: 1,
      freeDays: 0,
      interval: SubscriptionInterval.MONTH,
      name: "Premium",
      tripsPerMonth: 300,
    };
    const create = jest.fn(async () => ({ id: "sub1" }));
    const update = jest.fn(async () => ({ id: "sub1" }));
    const service = new SubscriptionService(
      {
        findCurrentByOwner: jest.fn(async () => null),
        create,
        update,
      } as never,
      { findById: jest.fn(async () => plan) } as never,
      { notify: jest.fn() } as never,
      {
        driver: { updateMany: jest.fn() },
        subscription: { updateMany: jest.fn(async () => ({ count: 1 })) },
        payment: { findMany: jest.fn(async () => []) },
      } as never,
      { tryOffSession: jest.fn() } as never,
      { warn: jest.fn(), log: jest.fn() } as never,
    );

    const result = await service.start({
      audience: Audience.DRIVER,
      owner: { referenceId: "drv1", freeUsedAt: null },
      planId: "plan1",
    });

    expect(result.checkoutRequired).toBe(true);
    if (result.checkoutRequired) {
      expect(result.isTrialCheckout).toBe(true);
      expect(result.amount).toBe(0);
    }
    expect(create).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sub1",
        data: expect.objectContaining({ trialEnd: expect.any(Date) }),
      }),
    );
  });
});
