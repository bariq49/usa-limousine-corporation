"use client";

import React from "react";
import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { useBookingStore } from "@/store/use-booking-store";
import { Stepper } from "@usa-limousine-corporation/ui/components/stepper";
import { IMAGES } from "@/constants/image-constants";
import { useLuggageTypes } from "@/hooks/queries/use-luggage";
import { formatPrice } from "@/lib/utils";
import type { Step3FormValues, Step3LuggageSelection } from "@/types/booking.types";

export const LuggageDetailsField = () => {
    const { control, setValue } = useFormContext<Step3FormValues>();
    const step2 = useBookingStore((state) => state.step2);
    const { data: luggageTypes = [] } = useLuggageTypes();
    const selected = useWatch({ control, name: "luggage" }) ?? [];

    const bagsCount = step2?.bags ?? 0;
    const maxBags = (step2?.vehicleCategory?.luggageCount || 0) * (step2?.vehicleCount ?? 1);

    if (bagsCount <= 0 || luggageTypes.length === 0) return null;

    const quantityOf = (id: string) =>
        selected.find((item) => item.id === id)?.quantity ?? 0;
    const selectedTotal = selected.reduce((sum, item) => sum + item.quantity, 0);

    const setQuantity = (item: Step3LuggageSelection) => {
        const others = selected.filter((entry) => entry.id !== item.id);
        setValue("luggage", item.quantity > 0 ? others.concat(item) : others, {
            shouldDirty: true,
        });
    };

    return (
        <div className="space-y-3">
            <div className="px-1">
                <h3 className="text-xl font-semibold text-gray-900 tracking-tight px-1">
                    Select Luggage
                </h3>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {luggageTypes.map((type) => {
                    const value = quantityOf(type.id);
                    const price = type.price ?? 0;
                    const max = Math.max(0, maxBags - (selectedTotal - value));

                    return (
                        <div
                            key={type.id}
                            className="flex items-center gap-3 rounded-sm border border-border bg-white px-3 py-2.5"
                        >
                            <div className="relative h-14 w-14 shrink-0 sm:h-16 sm:w-16">
                                <Image
                                    src={type.image || IMAGES.BAGS.CARRY_ON}
                                    alt={type.name}
                                    fill
                                    className="object-contain"
                                    sizes="64px"
                                />
                            </div>

                            <div className="min-w-0 flex-1 leading-snug">
                                <p className="truncate text-sm font-semibold text-gray-900">
                                    {type.name}
                                    {price > 0 ? (
                                        <span className="ml-1.5 text-xs font-medium text-secondary">
                                            (+{formatPrice(price)})
                                        </span>
                                    ) : null}
                                </p>
                                <p className="truncate text-xs text-gray-500">
                                    {type.dimensions || type.description}
                                </p>
                            </div>

                            <Stepper
                                value={value}
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
