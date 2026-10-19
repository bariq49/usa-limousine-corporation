import { Decimal } from "@prisma/client/runtime/library";

export function roundAmount(value: number): number {
  return Math.round(value * 100) / 100;
}

export function toAmount(value: unknown): number {
  if (value instanceof Decimal) {
    return roundAmount(value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber());
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return NaN;
  }
  return roundAmount(parsed);
}
