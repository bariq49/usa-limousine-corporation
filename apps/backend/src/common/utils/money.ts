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

export function decimalsToNumbers(value: unknown): unknown {
  if (Decimal.isDecimal(value)) {
    return (value as Decimal).toNumber();
  }
  if (Array.isArray(value)) {
    return value.map((item) => decimalsToNumbers(item));
  }
  if (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    const plain: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) {
      plain[key] = decimalsToNumbers(item);
    }
    return plain;
  }
  return value;
}
