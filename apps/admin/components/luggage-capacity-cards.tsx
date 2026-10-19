"use client";

import { QuantityStepper } from "@/components/quantity-stepper";
import { getLuggageIcon } from "@/components/columns/luggage-columns";
import type { Item as LuggageItem } from "@/lib/types/luggage";

type StandardLuggageCardProps = {
  item: LuggageItem;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

export function StandardLuggageCard(props: StandardLuggageCardProps) {
  const { item, quantity, onQuantityChange } = props;
  const Icon = getLuggageIcon(item.name);

  return (
    <div className="flex flex-col items-center rounded-md border border-default-200 bg-default-50/60 px-4 py-5 text-center">
      <Icon className="h-10 w-10 text-default-600" />
      <p className="mt-3 text-sm font-semibold text-default-900">{item.name}</p>
      {item.dimensions ? <p className="mt-1 text-xs text-default-500">{item.dimensions}</p> : null}
      <QuantityStepper className="mt-4" value={quantity} onChange={onQuantityChange} />
    </div>
  );
}

type SpecialLuggageCardProps = {
  item: LuggageItem;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
};

export function SpecialLuggageCard(props: SpecialLuggageCardProps) {
  const { item, quantity, onQuantityChange } = props;
  const Icon = getLuggageIcon(item.name);

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-default-200 bg-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-6 w-6 shrink-0 text-primary" />
        <p className="truncate text-sm font-semibold text-default-900">{item.name}</p>
      </div>
      <QuantityStepper value={quantity} onChange={onQuantityChange} />
    </div>
  );
}
