"use client";

import { formatPrice } from "../utils/price";

type Props = {
  label: string;
  value: number;
  destructive?: boolean;
  /** Formats the amount; defaults to the shared price format. */
  format?: (value: number) => string;
};

/** One line of a price breakdown; hidden when the amount is zero. */
export function PriceRow(props: Props) {
  const { label, value, destructive, format = (amount) => formatPrice({ price: amount }) } = props;

  if (!value) return null;

  return (
    <div
      className={`flex items-center justify-between font-medium ${
        destructive ? "text-destructive" : "text-gray-600"
      }`}
    >
      <span>{label}</span>
      <span className={destructive ? "font-medium" : "font-medium text-black"}>
        {destructive ? `- ${format(value)}` : format(value)}
      </span>
    </div>
  );
}
