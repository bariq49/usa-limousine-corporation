"use client";

import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Clock, Close, LocateFixed, Location, Spinner } from "@usa-limousine-corporation/ui/svg";
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
} from "@/lib/utils";
import { useSettings } from "@/hooks/queries/use-settings";
import { useCalculateRouteDistance } from "@/hooks/queries/use-calculate-distance";
import { SwapButton } from "../setp-1/SwapButton";
import { TripTypeTabs } from "../setp-1/TripTypeTabs";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogPortal, DialogTitle } from "@usa-limousine-corporation/ui/components/dialog";
import type { HeroFormValues } from "@/types/booking.types";
import { HOURLY_DURATIONS, TRIP_TYPES } from "@/constants/booking-constants";

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditBookingModal({ isOpen, onClose }: EditBookingModalProps) {
  const router = useRouter();
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
    getPickupLocation()
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
    // the backdrop below stands in for the modal overlay.
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} modal={false}>
      <DialogPortal>
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" aria-hidden />
      </DialogPortal>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl max-h-vh-90 overflow-y-auto p-0 border-none bg-transparent shadow-none"
        onInteractOutside={(e) => {
          const target = (e.detail.originalEvent.target ?? e.target) as HTMLElement | null;
          if (target?.closest?.("[data-location-dropdown]")) {
            e.preventDefault();
          }
        }}
      >
        <div className="flex flex-col w-full bg-white rounded-md overflow-hidden shadow-2xl">
          <div className="relative p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <DialogHeader className="p-0">
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Edit Your Trip
                </DialogTitle>
              </DialogHeader>
              <button
                onClick={onClose}
                className="cursor-pointer p-1 text-gray-400 hover:text-gray-900 transition-colors"
              >
                <Close className="h-6 w-6" />
              </button>
            </div>
          </div>

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
                      className="h-10 w-10 2xl:h-12 2xl:w-12 inline-flex shrink-0 items-center justify-center rounded-md border border-default-300 cursor-pointer bg-white text-secondary hover:bg-gray-50 transition-colors disabled:opacity-50"
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

              <Button type="submit" className="bg-secondary text-white hover:bg-secondary-600" isLoading={calculateRoute.isPending}>
                Update Ride Details
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
