"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { formatPrice } from "@/lib/utils";
import { useExtraServices } from "@/hooks/queries/use-extra-services";
import { ChildSeatSkeleton } from "@/components/skeletons/child-seat-skeleton";
import type { Step3ChildSeatSelection, Step3FormValues } from "@/types/booking.types";

type Props = {
  childSeatsField?: "childSeats" | "returnChildSeats";
  childSeatsEnabledField?: "childSeatsEnabled" | "returnChildSeatsEnabled";
  childSeatsLabel?: string;
  /** Driver notes are only offered for the outbound trip. */
  showNotes?: boolean;
};

export const TripExtrasFields = (props: Props = {}) => {
  const {
    childSeatsField = "childSeats",
    childSeatsEnabledField = "childSeatsEnabled",
    childSeatsLabel = "Child Seats",
    showNotes = true,
  } = props;

  const { control, setValue, getValues } = useFormContext<Step3FormValues>();
  const { data, isLoading } = useExtraServices();
  const seats = useMemo(
    () => (data ?? []).filter((service) => service.type === "CHILD_SEAT"),
    [data],
  );

  const childSeatsEnabled = useWatch({ control, name: childSeatsEnabledField });

  const showChildSeats = isLoading || seats.length > 0;
  const seatsReady = !isLoading && seats.length > 0;

  useEffect(() => {
    if (!childSeatsEnabled) {
      setValue(childSeatsField, [], { shouldDirty: false });
      return;
    }
    if (!seatsReady) return;

    const current: Step3ChildSeatSelection[] = getValues(childSeatsField) ?? [];
    const next: Step3ChildSeatSelection[] = seats.map((seat) => ({
      id: seat.id,
      name: seat.name,
      price: seat.price,
      quantity: current.find((item) => item.id === seat.id)?.quantity ?? 0,
    }));

    const aligned =
      current.length === next.length &&
      next.every((seat, index) => seat.id === current[index]?.id);

    if (!aligned) {
      setValue(childSeatsField, next, { shouldDirty: false });
    }
  }, [childSeatsEnabled, childSeatsField, seats, seatsReady, getValues, setValue]);

  return (
    <div className="space-y-3">
      {showChildSeats ? (
        <Input
          name={childSeatsEnabledField}
          type="switch"
          className="rounded-sm border border-border p-3"
          label={
            <span className="text-sm font-medium uppercase tracking-wide text-gray-900">
              {childSeatsLabel}
            </span>
          }
        />
      ) : null}

      {showChildSeats && childSeatsEnabled ? (
        <div className="space-y-3">
          {seatsReady
            ? seats.map((seat, index) => (
                <div
                  key={seat.id}
                  className="relative flex flex-col gap-4 rounded-sm border border-border bg-white px-3 py-4 sm:flex-row sm:items-center sm:gap-3 sm:py-3"
                >
                  <span className="absolute right-0 top-0 rounded-bl-sm rounded-tr-sm bg-secondary px-2.5 py-1 text-xs font-semibold leading-none text-white">
                    {seat.price === 0 ? "Free" : formatPrice(seat.price)}
                  </span>

                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm bg-gray-100 sm:h-16 sm:w-16">
                      {seat.image ? (
                        <Image src={seat.image} alt={seat.name} fill className="object-contain" sizes="64px" />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1 pr-12 leading-snug">
                      <p className="text-sm font-semibold text-gray-900">{seat.name}</p>
                      {seat.description ? (
                        <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">{seat.description}</p>
                      ) : null}
                    </div>
                  </div>

                  <Input
                    name={`${childSeatsField}.${index}.quantity`}
                    type="counter"
                    min={0}
                    max={10}
                    className="w-full shrink-0 sm:w-30"
                    inputClassName="h-9 2xl:h-10"
                  />
                </div>
              ))
            : Array.from({ length: 2 }, (_, index) => (
                <ChildSeatSkeleton key={`child-seat-skeleton-${index}`} />
              ))}
        </div>
      ) : null}

      {showNotes ? (
        <Input
          name="notes"
          type="textarea"
          placeholder="Notes for the driver (optional)"
          rows={5}
          inputClassName="min-h-30 rounded-sm border-gray-100 bg-gray-50/50 p-4"
        />
      ) : null}
    </div>
  );
};
