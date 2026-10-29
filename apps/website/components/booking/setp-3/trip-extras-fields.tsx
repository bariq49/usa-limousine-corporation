"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { Close, Plus } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { useExtraServices } from "@/hooks/queries/use-extra-services";
import { ChildSeatSkeleton } from "@/components/skeletons/child-seat-skeleton";
import type { Step3ChildSeatSelection, Step3FormValues } from "@/types/booking.types";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";

type Props = {
  childSeatsField?: "childSeats" | "returnChildSeats";
  childSeatsEnabledField?: "childSeatsEnabled" | "returnChildSeatsEnabled";
  childSeatsLabel?: string;
  notesField?: "notes" | "returnNotes";
  notesLabel?: string;
  showNotes?: boolean;
};

export const TripExtrasFields = (props: Props = {}) => {
  const {
    childSeatsField = "childSeats",
    childSeatsEnabledField = "childSeatsEnabled",
    childSeatsLabel = "Need a child or booster seat?",
    notesField = "notes",
    notesLabel = "Add notes for the driver",
    showNotes = true,
  } = props;

  const { control, setValue, getValues } = useFormContext<Step3FormValues>();
  const { data, isLoading } = useExtraServices();
  const seats = useMemo(
    () => (data ?? []).filter((service) => service.type === "CHILD_SEAT"),
    [data],
  );

  const childSeatsEnabled = useWatch({ control, name: childSeatsEnabledField });
  const [isNotesOpen, setIsNotesOpen] = useState(() => Boolean(getValues(notesField)));

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
      current.length === next.length && next.every((seat, index) => seat.id === current[index]?.id);

    if (!aligned) {
      setValue(childSeatsField, next, { shouldDirty: false });
    }
  }, [childSeatsEnabled, childSeatsField, seats, seatsReady, getValues, setValue]);

  const pillClassName = (isActive: boolean) =>
    cn(
      "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
      isActive
        ? "border-black bg-black text-white hover:bg-black/90"
        : "border-border bg-white text-black hover:bg-gray-50",
    );

  const toggleNotes = () => {
    if (isNotesOpen) setValue(notesField, "", { shouldDirty: true });
    setIsNotesOpen(!isNotesOpen);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {showChildSeats ? (
          <button
            type="button"
            aria-pressed={Boolean(childSeatsEnabled)}
            onClick={() =>
              setValue(childSeatsEnabledField, !childSeatsEnabled, { shouldDirty: true })
            }
            className={pillClassName(Boolean(childSeatsEnabled))}
          >
            {childSeatsEnabled ? <Close width={14} height={14} /> : <Plus width={16} height={16} />}
            {childSeatsLabel}
          </button>
        ) : null}
        {showNotes ? (
          <button
            type="button"
            aria-pressed={isNotesOpen}
            onClick={toggleNotes}
            className={pillClassName(isNotesOpen)}
          >
            {isNotesOpen ? <Close width={14} height={14} /> : <Plus width={16} height={16} />}
            {notesLabel}
          </button>
        ) : null}
      </div>

      {showChildSeats && childSeatsEnabled ? (
        <div className="space-y-3">
          {seatsReady ? (
            <div className="divide-y divide-border overflow-hidden rounded-sm border border-border bg-white">
              {seats.map((seat, index) => (
                <div
                  key={seat.id}
                  className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden">
                      {seat.image ? (
                        <Image
                          src={seat.image}
                          alt={seat.name}
                          fill
                          className="object-contain"
                          sizes="56px"
                        />
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1 leading-snug">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base text-black">{seat.name}</p>
                        <span
                          className={cn(
                            "rounded-sm border px-1.5 py-0.5 text-xs font-semibold leading-none",
                            seat.price === 0
                              ? "border-success text-success"
                              : "border-border text-black",
                          )}
                        >
                          {seat.price === 0 ? "Free" : formatPrice({ price: seat.price })}
                        </span>
                      </div>
                      {seat.description ? (
                        <p className="mt-1.5 text-sm text-gray-700">{seat.description}</p>
                      ) : null}
                    </div>
                  </div>

                  <Input
                    name={`${childSeatsField}.${index}.quantity`}
                    type="select"
                    valueAsNumber
                    options={[{ value: "0", label: "No" }].concat(
                      Array.from({ length: Math.max(seat.maxQuantity, 1) }, (_, count) => ({
                        value: String(count + 1),
                        label: String(count + 1),
                      })),
                    )}
                    className="w-full shrink-0 sm:w-28"
                  />
                </div>
              ))}
            </div>
          ) : (
            Array.from({ length: 2 }, (_, index) => (
              <ChildSeatSkeleton key={`child-seat-skeleton-${index}`} />
            ))
          )}
        </div>
      ) : null}

      {showNotes && isNotesOpen ? (
        <div className="space-y-3">
          <Input
            name={notesField}
            type="textarea"
            placeholder="Driver notes"
            rows={5}
            inputClassName="min-h-30 rounded-md bg-white p-4"
          />
        </div>
      ) : null}
    </div>
  );
};
