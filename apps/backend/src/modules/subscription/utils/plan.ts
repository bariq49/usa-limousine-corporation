import type { Prisma } from "@prisma/client";

type PlanPrice = {
  amount: Prisma.Decimal | number;
  tripsPerMonth: number | null;
};

function money(value: { toString(): string } | number): number {
  return Number(typeof value === "number" ? value : value.toString());
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** True when `next` is a strict upgrade vs `current` (higher price, or same price with more trips). */
export function isPlanUpgrade(current: PlanPrice, next: PlanPrice): boolean {
  const currentAmount = money(current.amount);
  const nextAmount = money(next.amount);
  if (nextAmount > currentAmount) {
    return true;
  }
  if (nextAmount < currentAmount) {
    return false;
  }
  return isTripsUpgrade(current.tripsPerMonth, next.tripsPerMonth);
}

function isTripsUpgrade(current: number | null, next: number | null): boolean {
  if (current == null && next == null) {
    return false;
  }
  if (next == null) {
    return current != null;
  }
  if (current == null) {
    return false;
  }
  return next > current;
}

/** True when `next` is a strict downgrade vs `current`. */
export function isPlanDowngrade(current: PlanPrice, next: PlanPrice): boolean {
  if (isPlanUpgrade(current, next)) {
    return false;
  }
  const currentAmount = money(current.amount);
  const nextAmount = money(next.amount);
  if (nextAmount < currentAmount) {
    return true;
  }
  if (nextAmount > currentAmount) {
    return false;
  }
  return isTripsDowngrade(current.tripsPerMonth, next.tripsPerMonth);
}

function isTripsDowngrade(current: number | null, next: number | null): boolean {
  if (current == null && next == null) {
    return false;
  }
  if (current == null) {
    return next != null;
  }
  if (next == null) {
    return false;
  }
  return next < current;
}

/**
 * Prorated charge for upgrading within the current period.
 * Full delta when period bounds are missing.
 */
export function proratedUpgradeCharge(params: {
  currentAmount: number;
  nextAmount: number;
  periodStart: Date | null | undefined;
  periodEnd: Date | null | undefined;
  now?: Date;
}): number {
  const delta = params.nextAmount - params.currentAmount;
  if (delta <= 0) {
    return 0;
  }

  const now = params.now ?? new Date();
  const { periodStart, periodEnd } = params;
  if (!periodStart || !periodEnd || periodEnd.getTime() <= periodStart.getTime()) {
    return roundMoney(delta);
  }

  const totalMs = periodEnd.getTime() - periodStart.getTime();
  const remainingMs = Math.max(0, periodEnd.getTime() - now.getTime());
  const ratio = Math.min(1, remainingMs / totalMs);
  return roundMoney(delta * ratio);
}
