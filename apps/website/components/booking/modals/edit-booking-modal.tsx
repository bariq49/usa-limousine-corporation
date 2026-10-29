"use client";

import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import {
  ArrowDownUp,
  Calendar,
  Clock,
  Close,
  LocateFixed,
  Location,
  Plus,
  Spinner,
} from "@usa-limousine-corporation/ui/svg";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { validateBookingTime } from "@usa-limousine-corporation/ui/utils/date";
import {
  getCurrentLocationErrorMessage,
  getPickupLocation,
  isAirportPickupRequired,
  isGeolocationError,
  swapPickupAndDelivery,
} from "@usa-limousine-corporation/ui/utils/location";
import { useBookingStore } from "@/store/use-booking-store";
import { useSettings } from "@/hooks/queries/use-settings";
import { useCalculateRouteDistance } from "@/hooks/queries/use-calculate-distance";
import { useHourlyDurations } from "@/hooks/queries/use-hourly-durations";
import { useMediaQuery } from "@/hooks/use-media-query";
import { TRIP_TYPES } from "@/constants/booking-constants";
import type { HeroFormValues, TripType } from "@/types/booking.types";

const SHEET_EASE = [0.32, 0.72, 0, 1] as const;

const TRIP_TABS = [
  { value: TRIP_TYPES.ONE_WAY, label: "One Way" },
  { value: TRIP_TYPES.HOURLY, label: "By the Hour" },
] as const;

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function EditBookingModal(props: Props) {
  const { isOpen, onClose } = props;
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const calculateRoute = useCalculateRouteDistance();
  const { setStep1Data, setBookingSettings, step1 } = useBookingStore();
  const { data: settings } = useSettings();

  const [isSwapping, setIsSwapping] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);

  const form = useForm<HeroFormValues>({
    defaultValues: {
      tripType: step1?.tripType === TRIP_TYPES.HOURLY ? TRIP_TYPES.HOURLY : TRIP_TYPES.ONE_WAY,
      pickupAddress: step1?.pickupAddress ?? "",
      deliveryAddress: step1?.deliveryAddress ?? "",
      stops: step1?.stops ?? [],
      pickupDate: step1?.pickupDate ?? "",
      pickupTime: step1?.pickupTime ?? "",
      hourlyDuration: step1?.hourlyDuration,
    },
  });

  const tripType = useWatch({ control: form.control, name: "tripType" });
  const isHourly = tripType === TRIP_TYPES.HOURLY;
  const { data: durationOptions = [] } = useHourlyDurations(isHourly);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });
  const stopFeePerStop = settings?.stopFee || 0;

  React.useEffect(() => {
    if (isOpen && step1) {
      form.reset({
        tripType: step1.tripType === TRIP_TYPES.HOURLY ? TRIP_TYPES.HOURLY : TRIP_TYPES.ONE_WAY,
        pickupAddress: step1.pickupAddress ?? "",
        deliveryAddress: step1.deliveryAddress ?? "",
        stops: step1.stops ?? [],
        pickupDate: step1.pickupDate ?? "",
        pickupTime: step1.pickupTime ?? "",
        hourlyDuration: step1.hourlyDuration,
      });
    }
  }, [isOpen, step1, form]);

  const handleSwapLocations = () => {
    setIsSwapping(true);
    swapPickupAndDelivery({
      form: {
        getValues: form.getValues,
        setValue: form.setValue,
      },
    });
    window.setTimeout(() => setIsSwapping(false), 300);
  };

  const handleUseCurrentLocation = () => {
    if (isLocating) return;
    setIsLocating(true);
    return getPickupLocation()
      .then((resolvedAddress) => {
        form.setValue("pickupAddress", resolvedAddress, {
          shouldDirty: true,
          shouldValidate: true,
        });
        toast.success("Location updated successfully");
      })
      .catch((error: unknown) => {
        if (isGeolocationError(error)) {
          toast.error(getCurrentLocationErrorMessage({ error }));
          return;
        }
        if (error instanceof Error && error.message) {
          toast.error(error.message);
          return;
        }
        toast.error("Could not fetch location. Please type your address manually.");
      })
      .finally(() => {
        setIsLocating(false);
      });
  };

  const onSubmit = async (values: HeroFormValues) => {
    try {
      const pickupValidation = validateBookingTime({
        date: values.pickupDate,
        time: values.pickupTime,
        minBookingMinutes: settings?.minBookingMinutes ?? 0,
      });
      if (!pickupValidation.isValid) {
        toast.error(
          pickupValidation.isPast
            ? "The pickup time has already passed. Please choose a later time."
            : `Booking can't be added within ${pickupValidation.timeDisplay} of pickup time, choose another time.`,
        );
        return;
      }

      const pickupAddress = values.pickupAddress.trim();
      const deliveryAddress = isHourly ? "" : values.deliveryAddress.trim();
      const stops = values.stops
        .map((stop) => ({ address: stop.address.trim() }))
        .filter((stop) => stop.address.length > 0);

      let distance: number | undefined;
      let travelDuration: number | undefined;
      if (!isHourly) {
        const addresses = [
          pickupAddress,
          ...stops.map((stop) => stop.address),
          ...(deliveryAddress ? [deliveryAddress] : []),
        ];
        if (addresses.length > 1) {
          const route = await calculateRoute.mutateAsync(addresses);
          distance = route.totalDistanceMiles;
          travelDuration = route.totalDurationMinutes;
        }
      }

      setStep1Data({
        tripType,
        pickupAddress,
        deliveryAddress,
        stops,
        pickupDate: values.pickupDate,
        pickupTime: values.pickupTime,
        distance,
        travelDuration,
        hourlyDuration: isHourly ? values.hourlyDuration : undefined,
        isAirportSelected: isAirportPickupRequired({ pickupAddress, deliveryAddress }),
      });
      if (settings) {
        setBookingSettings(settings);
      }

      router.push("/book-ride/select-vehicle");
      toast.success("Trip updated successfully");
      onClose();
    } catch {
      toast.error("Something went wrong, please check details and try again");
    }
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
                if (target?.closest?.("[data-location-dropdown], [data-picker-dropdown]")) {
                  e.preventDefault();
                }
              }}
            >
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 flex max-h-vh-90 w-full flex-col overflow-hidden rounded-t-sm bg-white shadow-2xl outline-none sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-xl sm:rounded-sm"
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
                      Edit your trip
                    </DialogPrimitive.Title>
                    <p className="text-sm text-gray-500">Update your route, date and time.</p>
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
                  <Form {...form}>
                    <form
                      onSubmit={(event) => {
                        event.stopPropagation();
                        void form.handleSubmit(onSubmit)(event);
                      }}
                      className="flex flex-col items-stretch gap-4 bg-white p-5 sm:p-6"
                    >
                      <div
                        role="tablist"
                        className="-mx-5 -mt-5 mb-1 grid grid-cols-2 overflow-hidden border-b border-border bg-white sm:-mx-6 sm:-mt-6"
                      >
                        {TRIP_TABS.map((tab) => {
                          const isActive = tripType === tab.value;
                          return (
                            <button
                              key={tab.value}
                              type="button"
                              role="tab"
                              aria-selected={isActive}
                              onClick={() => form.setValue("tripType", tab.value as TripType)}
                              className={cn(
                                "cursor-pointer py-3.5 text-sm font-bold uppercase tracking-wide transition-colors",
                                isActive
                                  ? "bg-secondary text-white"
                                  : "text-black hover:bg-gray-50",
                              )}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="relative mb-2 flex-1 space-y-4 md:mb-0">
                        <div className="absolute bottom-5 left-2 top-9 w-1 bg-border" />

                        <div className="flex items-center gap-1">
                          <div className="z-10 h-5 w-5 flex-shrink-0 rounded-full border-4 border-secondary bg-white" />
                          <div className="flex flex-1 items-end gap-1">
                            <Input
                              name="pickupAddress"
                              onUseCurrentLocation={handleUseCurrentLocation}
                              type="location"
                              label="Pickup Location"
                              placeholder="Enter Pickup Location"
                              className="flex-1"
                              required
                            />
                            <button
                              type="button"
                              onClick={handleUseCurrentLocation}
                              disabled={isLocating || calculateRoute.isPending}
                              className="inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-default-300 bg-white text-secondary transition-colors hover:bg-gray-50 disabled:opacity-50 sm:h-10 sm:w-10 2xl:h-12 2xl:w-12"
                            >
                              {isLocating ? (
                                <Spinner className="h-4 w-4 animate-spin" />
                              ) : (
                                <LocateFixed className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {fields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-1">
                            <div className="z-10 h-5 w-5 flex-shrink-0 rounded-full border-4 border-secondary bg-white" />
                            <div className="min-w-0 flex-1">
                              <div className="relative">
                                <Input
                                  name={`stops.${index}.address`}
                                  type="location"
                                  label={
                                    <>
                                      Stop {index + 1}
                                      {stopFeePerStop > 0 ? (
                                        <span className="ml-1 text-secondary">
                                          ({formatPrice({ price: stopFeePerStop })} extra)
                                        </span>
                                      ) : null}
                                    </>
                                  }
                                  placeholder="Enter Stop Location"
                                  className="flex-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => remove(index)}
                                  aria-label={`Remove stop ${index + 1}`}
                                  className="absolute -right-2 -top-2 z-20 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-secondary text-white"
                                >
                                  <Close width={12} height={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="relative left-px flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => append({ address: "" })}
                            className="group inline-flex cursor-pointer items-center gap-2 py-1 transition-all"
                            aria-label="Add a stop to your journey"
                          >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white shadow-sm transition-transform group-hover:scale-110">
                              <Plus className="h-3.5 w-3.5 stroke-3" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-wide text-secondary transition-transform group-hover:translate-x-1">
                              Add Stop
                            </span>
                          </button>
                          {!isHourly ? (
                            <button
                              type="button"
                              onClick={handleSwapLocations}
                              className="cursor-pointer self-center rounded p-1 transition-all duration-300 focus-visible:outline-secondary"
                              aria-label="Swap locations"
                            >
                              <ArrowDownUp
                                className={cn(
                                  "h-5 w-5 text-secondary transition-transform duration-300",
                                  isSwapping && "rotate-180",
                                )}
                              />
                            </button>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1">
                          {isHourly ? (
                            <>
                              <Clock className="z-10 h-5 w-5 flex-shrink-0 text-secondary" />
                              <Input
                                name="hourlyDuration"
                                type="select"
                                label="Hourly Duration"
                                placeholder={
                                  durationOptions.length
                                    ? "Select Hours"
                                    : "No hourly options available"
                                }
                                options={durationOptions}
                                valueAsNumber
                                className="flex-1"
                                required
                                disabled={!durationOptions.length}
                              />
                            </>
                          ) : (
                            <>
                              <Location className="z-10 h-5 w-5 flex-shrink-0 text-secondary" />
                              <Input
                                name="deliveryAddress"
                                type="location"
                                label="Drop-off Location"
                                placeholder="Enter Drop-off Location"
                                className="flex-1"
                                required
                              />
                            </>
                          )}
                        </div>

                        {isHourly && durationOptions.length === 0 ? (
                          <p className="pl-6 text-sm text-destructive">
                            Hourly hire is not available right now. Please choose one-way or try
                            again later.
                          </p>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          name="pickupDate"
                          type="date"
                          label="Pickup Date"
                          placeholder="Select Pickup Date"
                          icon={<Calendar width={16} height={16} className="text-gray-400" />}
                          disablePast
                          required
                        />
                        <Input
                          name="pickupTime"
                          type="time"
                          label="Pickup Time"
                          placeholder="Select Pickup Time"
                          icon={<Clock width={16} height={16} className="text-gray-400" />}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="bg-secondary text-white hover:bg-secondary-600"
                        isLoading={calculateRoute.isPending}
                        disabled={isHourly && durationOptions.length === 0}
                      >
                        Update Ride Details
                      </Button>
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
