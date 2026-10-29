"use client";

import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { useBookingStore } from "../../store/booking";
import { Stepper } from "../stepper";
import { Luggage } from "../../svg";
import { useLuggageTypes } from "../../hooks/use-booking";
import type { Step3FormValues, LuggageItem } from "../../types/booking";
import { formatPrice } from "../../utils/price";

export const LuggageDetailsField = () => {
  const { control, setValue } = useFormContext<Step3FormValues>();
  const step2 = useBookingStore((state) => state.step2);
  const vehicleCategoryId = step2?.vehicleCategory.id;
  const vehicleCount = step2?.vehicleCount ?? 1;
  const bagsCount = step2?.bags ?? 0;
  const { data: luggageTypes = [] } = useLuggageTypes(vehicleCategoryId);
  const selected = useWatch({ control, name: "luggage" }) ?? [];

  if (bagsCount <= 0 || luggageTypes.length === 0) return null;

  const quantityOf = (id: string) => selected.find((item) => item.id === id)?.quantity ?? 0;
  const selectedTotal = selected.reduce((sum, item) => sum + item.quantity, 0);

  const setQuantity = (item: LuggageItem) => {
    const others = selected.filter((entry) => entry.id !== item.id);
    setValue("luggage", item.quantity > 0 ? others.concat(item) : others, {
      shouldDirty: true,
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {luggageTypes.map((type) => {
          const value = quantityOf(type.id);
          const price = type.price ?? 0;
          const typeMax = type.maxQuantity * vehicleCount;
          const remainingBags = Math.max(0, bagsCount - (selectedTotal - value));
          const max = Math.min(typeMax, remainingBags);

          return (
            <div
              key={type.id}
              className="flex items-center gap-3 rounded-sm border border-border bg-white px-3 py-2.5"
            >
              <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
                {type.image ? (
                  <Image
                    src={type.image}
                    alt={type.name}
                    fill
                    className="object-contain"
                    sizes="64px"
                  />
                ) : (
                  <Luggage className="h-full w-full p-3 text-gray-400" aria-hidden />
                )}
              </div>

              <div className="min-w-0 flex-1 leading-snug">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {type.name}
                  {price > 0 ? (
                    <span className="ml-1.5 text-xs font-medium text-secondary">
                      (+{formatPrice({ price: price })})
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {type.dimensions || type.description}
                </p>
              </div>

              <Stepper
                value={Math.min(value, max)}
                min={0}
                max={max}
                onChange={(next) =>
                  setQuantity({
                    id: type.id,
                    name: type.name,
                    price,
                    quantity: next,
                  })
                }
                className="shrink-0"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
