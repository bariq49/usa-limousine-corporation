"use client";

import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import {
  Calendar,
  Clock,
  Close,
  LocateFixed,
  Location,
  Spinner,
} from "@usa-limousine-corporation/ui/svg";
import { useBookingStore } from "@/store/use-booking-store";
import { AddStopButton } from "../setp-1/AddStopButton";
import { StopItem } from "../setp-1/StopItem";
import {
  getCurrentLocationErrorMessage,
  isAirportPickupRequired,
  isGeolocationError,
  getPickupLocation,
  swapPickupAndDelivery,
  formatHrs,
  validateBookingTime,
} from "@/lib/utils";
import { useSettings } from "@/hooks/queries/use-settings";
import { useCalculateRouteDistance } from "@/hooks/queries/use-calculate-distance";
import { SwapButton } from "../setp-1/SwapButton";
import { TripTypeTabs } from "../setp-1/TripTypeTabs";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { HeroFormValues } from "@/types/booking.types";
import { HOURLY_DURATIONS, TRIP_TYPES } from "@/constants/booking-constants";

const SHEET_EASE = [0.32, 0.72, 0, 1] as const;

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditBookingModal({ isOpen, onClose }: EditBookingModalProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 639px)");
  const calculateRoute = useCalculateRouteDistance();
  const [isSwapping, setIsSwapping] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);

  const { setStep1Data, setBookingSettings, step1 } = useBookingStore();

  const { data: settings } = useSettings();

  const form = useForm<HeroFormValues>({
    defaultValues: {
      tripType: step1?.tripType === TRIP_TYPES.HOURLY ? TRIP_TYPES.HOURLY : TRIP_TYPES.ONE_WAY,
      pickupAddress: step1?.pickupAddress ?? "",
      deliveryAddress: step1?.deliveryAddress ?? "",
      stops: step1?.stops ?? [],
      pickupDate: step1?.pickupDate ?? "",
      pickupTime: step1?.pickupTime ?? "",
      duration: step1?.duration,
    },
  });

  const tripType = useWatch({ control: form.control, name: "tripType" });
  const isHourly = tripType === TRIP_TYPES.HOURLY;
  const durationOptions = HOURLY_DURATIONS.map((hours) => ({
    label: formatHrs(hours),
    value: String(hours),
  }));

  React.useEffect(() => {
    if (isOpen && step1) {
      form.reset({
        tripType: step1.tripType === TRIP_TYPES.HOURLY ? TRIP_TYPES.HOURLY : TRIP_TYPES.ONE_WAY,
        pickupAddress: step1.pickupAddress ?? "",
        deliveryAddress: step1.deliveryAddress ?? "",
        stops: step1.stops ?? [],
        pickupDate: step1.pickupDate ?? "",
        pickupTime: step1.pickupTime ?? "",
        duration: step1.duration,
      });
    }
  }, [isOpen, step1, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });

  const stopFeePerStop = settings?.stopFee || 0;

  const handleSwapLocations = () => {
    setIsSwapping(true);
    swapPickupAndDelivery({
      getValues: form.getValues,
      setValue: form.setValue,
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
          toast.error(getCurrentLocationErrorMessage(error));
          return;
        }
        toast.error("Could not fetch location. Please type your address manually.");
      })
      .finally(() => {
        setIsLocating(false);
      });
  };

  const onSubmit = async (data: HeroFormValues) => {
    try {
      if (isHourly && !data.duration) {
        toast.error("Please select how many hours you need");
        return;
      }

      const pickupValidation = validateBookingTime({
        date: data.pickupDate,
        time: data.pickupTime,
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

      const pickupAddress = data.pickupAddress.trim();
      const deliveryAddress = isHourly ? "" : data.deliveryAddress.trim();
      const normalizedStops = data.stops
        .map((stop) => ({ address: stop.address.trim() }))
        .filter((stop) => stop.address.length > 0);

      const addresses: string[] = [pickupAddress];
      normalizedStops.forEach((stop) => {
        if (stop.address) {
          addresses.push(stop.address);
        }
      });
      if (deliveryAddress) {
        addresses.push(deliveryAddress);
      }

      let routeResult = null;
      if (addresses.length > 1) {
        routeResult = await calculateRoute.mutateAsync(addresses);
      }

      const isAirportSelected = isAirportPickupRequired(pickupAddress, deliveryAddress);

      setStep1Data({
        tripType,
        pickupAddress,
        deliveryAddress,
        stops: normalizedStops,
        pickupDate: data.pickupDate,
        pickupTime: data.pickupTime,
        distance: routeResult?.totalDistanceMiles,
        travelDuration: routeResult?.totalDurationMinutes,
        duration: isHourly ? data.duration : undefined,
        isAirportSelected,
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
    // Non-modal so the address dropdown (portaled to <body>) keeps focus and clicks;
    // the backdrop stands in for the modal overlay.
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
                        // The modal can sit inside the passenger form in the React tree; keep its
                        // submit from reaching that form.
                        event.stopPropagation();
                        void form.handleSubmit(onSubmit)(event);
                      }}
                      className="p-5 sm:p-6 bg-white flex flex-col items-stretch gap-4"
                    >
                      <TripTypeTabs
                        value={tripType}
                        onChange={(value) => form.setValue("tripType", value)}
                        className="-mx-5 -mt-5 mb-1 border-b border-border sm:-mx-6 sm:-mt-6"
                      />

                      <div className="relative mb-2 md:mb-0 space-y-4 flex-1">
                        <div className="absolute left-2 top-9 bottom-5 w-1 bg-border" />

                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded-full border-4 border-secondary bg-white z-10 flex-shrink-0" />
                          <div className="flex items-end gap-1 flex-1">
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
                              className="h-12 w-12 sm:h-10 sm:w-10 2xl:h-12 2xl:w-12 inline-flex shrink-0 items-center justify-center rounded-md border border-default-300 cursor-pointer bg-white text-secondary hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              {isLocating ? (
                                <Spinner className="w-4 h-4 animate-spin" />
                              ) : (
                                <LocateFixed className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        {fields.map((field, index) => (
                          <StopItem
                            key={field.id}
                            index={index}
                            onRemove={remove}
                            stopFeePerStop={stopFeePerStop}
                          />
                        ))}

                        <div className="relative flex items-center justify-between left-px">
                          <AddStopButton onAdd={() => append({ address: "" })} label="Add Stop" />
                          {!isHourly ? (
                            <SwapButton
                              onSwap={handleSwapLocations}
                              isSwapping={isSwapping}
                              className="self-center"
                            />
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1">
                          {isHourly ? (
                            <>
                              <Clock className="w-5 h-5 text-secondary z-10 flex-shrink-0" />
                              <Input
                                name="duration"
                                type="select"
                                label="Duration"
                                placeholder="Select Hours"
                                options={durationOptions}
                                valueAsNumber
                                className="flex-1"
                                required
                              />
                            </>
                          ) : (
                            <>
                              <Location className="w-5 h-5 text-secondary z-10 flex-shrink-0" />
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
