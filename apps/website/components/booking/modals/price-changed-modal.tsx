"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";

const SHEET_EASE = [0.32, 0.72, 0, 1] as const;

interface PriceChangedModalProps {
  change: { previousTotal: number; total: number } | null;
  onClose: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
}

export function PriceChangedModal({ change, onClose, onConfirm, isConfirming }: PriceChangedModalProps) {
  return (
    <DialogPrimitive.Root open={Boolean(change)} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {change ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm rounded-sm bg-white p-5 shadow-2xl outline-none max-sm:w-auto max-sm:inset-x-4"
                initial={{ opacity: 0, scale: 0.96, x: "-50%", y: "-46%" }}
                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={{ opacity: 0, scale: 0.96, x: "-50%", y: "-46%" }}
                transition={{ duration: 0.3, ease: SHEET_EASE }}
              >
                <DialogPrimitive.Title className="text-base font-bold text-gray-900">
                  Your price has changed
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-1 text-sm text-gray-500">
                  The fare for this trip was updated since it was quoted. Please confirm the new
                  price to continue.
                </DialogPrimitive.Description>

                <div className="mt-4 flex items-center justify-between rounded-sm bg-gray-50 px-4 py-3">
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice({ price: change.previousTotal })}
                  </span>
                  <span className="text-xl font-semibold text-black">
                    {formatPrice({ price: change.total })}
                  </span>
                </div>

                <div className="mt-5 flex gap-3">
                  <Button
                    type="button"
                    onClick={onClose}
                    className="h-11 flex-1 rounded-sm border border-border bg-white font-semibold text-black hover:bg-gray-50"
                  >
                    Review trip
                  </Button>
                  <Button
                    type="button"
                    onClick={onConfirm}
                    isLoading={isConfirming}
                    className="h-11 flex-1 rounded-sm bg-black font-semibold text-white hover:bg-black/90"
                  >
                    Book at {formatPrice({ price: change.total })}
                  </Button>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
