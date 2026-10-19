export type PriceInput = number | string | null | undefined;

export interface FormatPriceProps {
  price?: PriceInput;
  currency?: string | undefined;
  currencySymbol?: string | undefined;
  fallback?: string | undefined;
}
