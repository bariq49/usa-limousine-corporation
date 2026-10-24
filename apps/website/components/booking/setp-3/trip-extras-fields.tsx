"use client";

import { useEffect } from "react";
import { Armchair, Baby, Close, FileText, MessageSquare, Plus } from "@usa-limousine-corporation/ui/svg";
import { useFormContext, useWatch } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { cn, formatPrice } from "@/lib/utils";
import { useChildSeats } from "@/hooks/queries/use-child-seats";
import { ChildSeatSkeleton } from "@/components/skeletons/child-seat-skeleton";
import type { Step3ChildSeatSelection, Step3FormValues } from "@/types/booking.types";

function SeatIcon({ name }: { name: string }) {
  const isBooster = name.toLowerCase().includes("boost");
  const Icon = isBooster ? Armchair : Baby;

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-gray-100 text-secondary">
      <Icon className="h-6 w-6" />
    </div>
  );
}

type Props = {
  childSeatsField?: "childSeats" | "returnChildSeats";
  childSeatsEnabledField?: "childSeatsEnabled" | "returnChildSeatsEnabled";
  notesField?: "notes" | "returnNotes";
  notesEnabledField?: "notesEnabled" | "returnNotesEnabled";
  childSeatsToggleLabel?: string;
  notesToggleLabel?: string;
  notesLabel?: string;
  notesPlaceholder?: string;
};

export const TripExtrasFields = (props: Props = {}) => {
  const {
    childSeatsField = "childSeats",
    childSeatsEnabledField = "childSeatsEnabled",
    notesField = "notes",
    notesEnabledField = "notesEnabled",
    childSeatsToggleLabel = "Need a child or booster seat?",
    notesToggleLabel = "Add notes for the driver",
    notesLabel = "Driver notes",
    notesPlaceholder = "Add any special instructions for your driver...",
  } = props;

  const { control, setValue, getValues } = useFormContext<Step3FormValues>();
  const { data, isLoading } = useChildSeats();
  const seats = data?.items ?? [];

  const childSeatsEnabled = useWatch({ control, name: childSeatsEnabledField });
  const notesEnabled = useWatch({ control, name: notesEnabledField });

  const showChildSeats = isLoading || seats.length > 0;
  const showSeatList = showChildSeats && childSeatsEnabled;
  const seatsReady = !isLoading && seats.length > 0;

  useEffect(() => {
    if (!childSeatsEnabled || !seatsReady) return;

    const current = (getValues(childSeatsField) ?? []) as Step3ChildSeatSelection[];
    const next: Step3ChildSeatSelection[] = seats.map(
      (seat: { _id: string; name: string; price: number }) => {
        const existing = current.find((item) => item.id === seat._id);
        return {
          id: seat._id,
          name: seat.name,
          price: seat.price,
          quantity: existing?.quantity ?? 0,
        };
      }
    );

    const aligned =
      current.length === next.length &&
      next.every((seat, index) => seat.id === current[index]?.id);

    if (!aligned) {
      setValue(childSeatsField, next, { shouldDirty: false });
    }
  }, [
    childSeatsEnabled,
    childSeatsField,
    seats,
    seatsReady,
    getValues,
    setValue,
  ]);

  const toggleChildSeats = () => {
    const next = !childSeatsEnabled;
    setValue(childSeatsEnabledField, next, { shouldDirty: true });
    if (!next) setValue(childSeatsField, [], { shouldDirty: true });
  };

  const toggleNotes = () => {
    const next = !notesEnabled;
    setValue(notesEnabledField, next, { shouldDirty: true });
    if (!next) setValue(notesField, "", { shouldDirty: true });
  };

  return (
    <div className="space-y-3 pt-2">
      {showChildSeats ? (
        <Button
          type="button"
          onClick={toggleChildSeats}
          className={cn(
            "flex h-auto w-full items-center justify-center gap-2 rounded-sm py-2 text-sm font-bold transition-all",
            childSeatsEnabled
              ? "border-transparent bg-secondary text-white shadow-sm hover:bg-secondary/90"
              : "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {childSeatsEnabled ? <Close width={16} height={16} /> : <Plus width={16} height={16} />}
          <span>{childSeatsToggleLabel}</span>
        </Button>
      ) : null}

      {showSeatList ? (
        <div className="space-y-2 border-t border-gray-50 pt-3">
          {!seatsReady
            ? Array.from({ length: 2 }).map((_, index) => (
              <ChildSeatSkeleton key={`child-seat-skeleton-${index}`} />
            ))
            : seats.map(
              (
                seat: {
                  _id: string;
                  name: string;
                  price: number;
                  description?: string;
                },
                index: number
              ) => (
                <div
                  key={seat._id}
                  className="relative flex flex-col gap-4 rounded-sm border border-border bg-white px-3 py-4 sm:flex-row sm:items-center sm:gap-3 sm:py-3"
                >
                  <span className="absolute right-0 top-0 z-20 inline-flex items-center rounded-bl-sm rounded-tr-sm bg-secondary px-2.5 py-1 text-xs font-semibold leading-none text-white">
                    {seat.price === 0 ? "Free" : formatPrice(seat.price)}
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-0">
                    <div className="flex items-center gap-3">
                      <SeatIcon name={seat.name} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-1.5 pr-12">
                          <p className="text-sm font-semibold text-gray-900">
                            {seat.name}
                          </p>
                        </div>
                        {seat.description ? (
                          <p className="mt-0.5 hidden text-sm leading-snug text-gray-500 sm:block">
                            {seat.description}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {seat.description ? (
                      <p className="mt-1 text-sm leading-snug text-gray-500 sm:hidden">
                        {seat.description}
                      </p>
                    ) : null}
                  </div>

                  <Input
                    name={`${childSeatsField}.${index}.quantity`}
                    type="counter"
                    min={0}
                    max={10}
                    className="relative z-0 w-full shrink-0 sm:w-30"
                  />
                </div>
              )
            )}
        </div>
      ) : null}

      <Button
        type="button"
        onClick={toggleNotes}
        className={cn(
          "flex h-auto w-full items-center justify-center gap-2 rounded-sm py-2 text-sm font-bold transition-all",
          notesEnabled
            ? "border-transparent bg-secondary text-white shadow-sm hover:bg-secondary/90"
            : "border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200"
        )}
      >
        {notesEnabled ? <Close width={16} height={16} /> : <Plus width={16} height={16} />}
        <span>{notesToggleLabel}</span>
      </Button>

      {notesEnabled ? (
        <div className="relative border-t border-gray-50 pt-3">
          <Input
            label={notesLabel}
            name={notesField}
            type="textarea"
            placeholder={notesPlaceholder}
            rows={5}
            inputClassName="min-h-30 rounded-sm border-gray-100 bg-gray-50/50 p-4"
          />
          <div className="pointer-events-none absolute bottom-4 right-4 flex items-center gap-3 text-orange-500">
            <FileText width={18} height={18} />
            <MessageSquare width={18} height={18} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
