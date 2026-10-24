"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Car, ChevronRight, Close } from "@usa-limousine-corporation/ui/svg";
import SummaryDetails from "@/components/booking/summary-details";
import { useBookingStore } from "@/store/use-booking-store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";

const SHEET_EASE = [0.32, 0.72, 0, 1] as const;

/** Selected vehicle row for small screens; "Details" opens the full booking summary. */
type Props = {
  /** The step's main button, repeated at the bottom of the open sheet. */
  action?: ReactNode;
};

export default function MobileSummary({ action }: Props) {
  const hasHydrated = useHasHydrated();
  const [isOpen, setIsOpen] = useState(false);
  const step2 = useBookingStore((s) => s.step2);
  const vehicle = step2?.vehicleCategory;
  const vehicleCount = step2?.vehicleCount ?? 1;

  if (!hasHydrated || !vehicle) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mb-3 flex w-full cursor-pointer items-center gap-3 border-b border-border pb-3 text-left xl:hidden"
      >
        <div className="relative flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-gray-50">
          {vehicle.image ? (
            <Image
              src={vehicle.image}
              alt={vehicle.name}
              fill
              className="object-contain"
              sizes="80px"
            />
          ) : (
            <Car className="h-8 w-8 text-gray-300" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-gray-900">
            {vehicle.name}
            {vehicleCount > 1 ? ` × ${vehicleCount}` : ""}
          </p>
          <p className="truncate text-xs text-gray-500">{vehicle.description || "Or similar"}</p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-gray-900 underline underline-offset-2">
          Details
          <ChevronRight width={16} height={16} />
        </span>
      </button>

      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <AnimatePresence>
          {isOpen ? (
            <DialogPrimitive.Portal forceMount>
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </DialogPrimitive.Overlay>
              <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-vh-90 w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-sheet-strong outline-none sm:max-w-lg"
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.45, ease: SHEET_EASE }}
                >
                  <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                    <button
                      type="button"
                      aria-label="Close"
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer text-gray-900"
                    >
                      <Close width={22} height={22} />
                    </button>
                    <DialogPrimitive.Title className="flex-1 pr-6 text-center text-lg font-semibold text-gray-900">
                      Review your booking
                    </DialogPrimitive.Title>
                  </div>
                  <div className="overflow-y-auto p-4">
                    <SummaryDetails className="border-0 p-0 shadow-none sm:p-0" />
                  </div>
                  {action ? (
                    <div className="flex border-t border-border bg-white px-4 py-3">{action}</div>
                  ) : null}
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          ) : null}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </>
  );
}
