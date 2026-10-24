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
      className={`flex items-center justify-between font-normal ${
        destructive ? "text-destructive" : "text-gray-500"
      }`}
    >
      <span>{label}</span>
      <span className={destructive ? "font-medium" : "font-medium text-gray-800"}>
        {destructive ? `- ${format(value)}` : format(value)}
      </span>
    </div>
  );
}
