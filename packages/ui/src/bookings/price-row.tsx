"use client";

import { formatPrice } from "../utils/price";
import type { PriceRowProps } from "../types/price-row";

export function PriceRow(props: PriceRowProps) {
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
