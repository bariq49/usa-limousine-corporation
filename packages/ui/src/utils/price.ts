import { APP_CURRENCY } from "../constants/index";
import type { FormatPriceProps } from "../types/price";

export type { FormatPriceProps };

export function formatPrice(props?: FormatPriceProps): string {
  const { price, currency = APP_CURRENCY, currencySymbol, fallback = "—" } = props ?? {};
  const symbol = currencySymbol ?? currency;

  if (price === null || price === undefined || price === "") {
    return fallback;
  }

  const value = typeof price === "number" ? price : Number(price);
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return `${symbol}${value.toFixed(2)}`;
}
