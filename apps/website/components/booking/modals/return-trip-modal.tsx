"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Calendar, Clock, Close } from "@usa-limousine-corporation/ui/svg";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import { BookingLocationDetails } from "@usa-limousine-corporation/ui/bookings/booking-location-details";
import { useTimeFormat } from "@usa-limousine-corporation/ui/store/time-format";
import { useBookingStore } from "@/store/use-booking-store";
import { calculateArrivalTime, formatDistance, formatDuration, formatTime } from "@/lib/utils";

type ReturnTripFormValues = {
  returnDate: string;
  returnTime: string;
};

const SHEET_EASE = [0.32, 0.72, 0, 1] as const;

interface ReturnTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReturnTripModal({ isOpen, onClose }: ReturnTripModalProps) {
  const { step1, step3, setReturnTrip } = useBookingStore();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const hourCycle = useTimeFormat((state) => state.hourCycle);

  const form = useForm<ReturnTripFormValues>({
    defaultValues: {
      returnDate: step3?.returnDate ?? "",
      returnTime: step3?.returnTime ?? "",
    },
  });

  const returnTime = useWatch({ control: form.control, name: "returnTime" });
  const distance = step1?.distance;
  const arrivalTime = calculateArrivalTime({
    hourCycle,
    time: returnTime,
    durationMinutes: step1?.travelDuration,
  });
  const routeNote = [
    formatDuration(step1?.travelDuration),
    distance ? `${(distance * 1.60934).toFixed(1)} km / ${formatDistance(distance)}` : null,
  ]
    .filter(Boolean)
    .map((value) => `~ ${value}`)
    .join(" · ");

  useEffect(() => {
    if (isOpen) {
      form.reset({
        returnDate: step3?.returnDate ?? "",
        returnTime: step3?.returnTime ?? "",
      });
    }
  }, [isOpen, form, step3?.returnDate, step3?.returnTime]);

  const onSubmit = (values: ReturnTripFormValues) => {
    const pickup = `${step1?.pickupDate ?? ""} ${step1?.pickupTime ?? ""}`;
    if (`${values.returnDate} ${values.returnTime}` <= pickup) {
      toast.error("The return must be after the pickup date and time.");
      return;
    }

    setReturnTrip({ returnDate: values.returnDate, returnTime: values.returnTime });
    onClose();
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()} modal={false}>
      <AnimatePresence>
        {isOpen ? (
          <DialogPrimitive.Portal forceMount>
            <motion.div
              key="backdrop"
              aria-hidden
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />
            <DialogPrimitive.Content
              asChild
              forceMount
              aria-describedby={undefined}
              onInteractOutside={(e) => {
                const target = (e.detail.originalEvent.target ?? e.target) as HTMLElement | null;
                if (target?.closest?.("[data-picker-dropdown]")) {
                  e.preventDefault();
                }
              }}
            >
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 flex max-h-vh-90 w-full flex-col overflow-hidden rounded-t-sm bg-white shadow-2xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:rounded-sm"
                initial={
                  isMobile ? { y: "100%" } : { opacity: 0, scale: 0.96, x: "-50%", y: "-46%" }
                }
                animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.96, x: "-50%", y: "-46%" }}
                transition={{ duration: 0.35, ease: SHEET_EASE }}
              >
                <div className="flex shrink-0 items-start gap-3 border-b border-border px-5 py-4">
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <DialogPrimitive.Title className="text-base font-bold text-gray-900">
                      Add return
                    </DialogPrimitive.Title>
                    <p className="text-sm text-gray-500">
                      When should we pick you up for the trip back?
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={onClose}
                    className="-mr-1 cursor-pointer p-1 text-gray-400 transition-colors hover:text-gray-900"
                  >
                    <Close className="h-5 w-5" />
                  </button>
                </div>
                <div className="overflow-y-auto">
                  <div className="px-5 py-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Return route
                    </p>
                    <BookingLocationDetails
                      pickupLocation={step1?.deliveryAddress}
                      dropoffLocation={step1?.pickupAddress}
                      stops={(step1?.stops ?? [])
                        .map((stop) => stop.address.trim())
                        .filter(Boolean)
                        .reverse()}
                      pickupTime={returnTime ? formatTime(returnTime, hourCycle) : undefined}
                      dropoffTime={returnTime && arrivalTime !== "—" ? arrivalTime : undefined}
                      note={routeNote}
                      variant="plain"
                    />
                  </div>

                  <Form {...form}>
                    <form
                      onSubmit={(event) => {
                        event.stopPropagation();
                        void form.handleSubmit(onSubmit)(event);
                      }}
                      className="flex flex-col gap-4 border-t border-border px-5 pb-5 pt-5"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                        <Input
                          name="returnDate"
                          type="date"
                          label="Return Date"
                          placeholder="Select Return Date"
                          icon={<Calendar width={16} height={16} className="text-gray-400" />}
                          disablePast
                          minDate={step1?.pickupDate || undefined}
                          required
                        />
                        <Input
                          name="returnTime"
                          type="time"
                          label="Return Time"
                          placeholder="Select Return Time"
                          icon={<Clock width={16} height={16} className="text-gray-400" />}
                          required
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={onClose}
                          className="h-11 flex-1 rounded-sm border border-border bg-white font-semibold text-black hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="h-11 flex-1 rounded-sm bg-black font-semibold text-white hover:bg-black/90"
                        >
                          Add Return
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
