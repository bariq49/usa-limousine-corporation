"use client";

import type { ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Close } from "../../svg";
import SummaryDetails from "./summary-details";
import { useBookingStore } from "../../store/booking";
import { useHasHydrated } from "../../hooks/use-booking";

const SHEET_EASE = [0.32, 0.72, 0, 1] as const;

/** Bottom sheet with the full booking summary for small screens. */
type Props = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** The step's main button, repeated at the bottom of the open sheet. */
  action?: ReactNode;
};

export default function MobileSummary({ isOpen, onOpenChange, action }: Props) {
  const hasHydrated = useHasHydrated();
  const vehicle = useBookingStore((s) => s.step2?.vehicleCategory);

  if (!hasHydrated || !vehicle) return null;

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
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
                className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-vh-90 w-full flex-col overflow-hidden rounded-t-sm bg-white shadow-sheet-strong outline-none sm:max-w-lg"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ duration: 0.45, ease: SHEET_EASE }}
              >
                <div className="flex items-center gap-3 border-b border-border px-4 py-4">
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={() => onOpenChange(false)}
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
  );
}
