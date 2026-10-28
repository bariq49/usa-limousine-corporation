"use client";

import React from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Calendar, Clock, LocateFixed, Location, Spinner } from "@usa-limousine-corporation/ui/svg";
import { useRouter } from "next/navigation";
import { useBookingStore } from "@/store/use-booking-store";
import { AddStopButton } from "./AddStopButton";
import { StopItem } from "./StopItem";
import {
  getCurrentLocationErrorMessage,
  isAirportPickupRequired,
  isGeolocationError,
  getPickupLocation,
  swapPickupAndDelivery,
  formatHrs,
  validateBookingTime,
} from "@/lib/utils";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { useSettings } from "@/hooks/queries/use-settings";
import { useCalculateRouteDistance } from "@/hooks/queries/use-calculate-distance";
import { SwapButton } from "./SwapButton";
import { TripTypeTabs } from "./TripTypeTabs";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import toast from "react-hot-toast";
import type { HeroFormValues } from "@/types/booking.types";
import { HOURLY_DURATIONS, TRIP_TYPES } from "@/constants/booking-constants";
import { Step1FormSkeleton } from "@/components/skeletons/step-1-form-skeleton";

function Step1() {
  const router = useRouter();
  const calculateRoute = useCalculateRouteDistance();
  const [isSwapping, setIsSwapping] = React.useState(false);
  const [isLocating, setIsLocating] = React.useState(false);
  const hasHydrated = useHasHydrated();

  const { setStep1Data, setBookingSettings, step1 } = useBookingStore();
  const { data: settings, isLoading: isSettingsLoading } = useSettings();

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

  const isFormLoading = !hasHydrated || isSettingsLoading;

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stops",
  });

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
          `Booking can't be added within ${pickupValidation.timeDisplay} of pickup time, choose another time.`,
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
      router.replace("/book-ride/select-vehicle");
    } catch {
      toast.error("Something went wrong, please check details and try again");
    }
  };

  if (isFormLoading) {
    return (
      <div className="flex flex-col w-full max-w-screen-sm mx-auto" id="booking">
        <Step1FormSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-screen-sm mx-auto" id="booking">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="relative z-10 flex flex-col items-stretch gap-4 rounded-t-md rounded-b-none bg-white p-5 shadow-none sm:p-6 md:rounded-md md:shadow-xl"
        >
          <TripTypeTabs
            value={tripType}
            onChange={(value) => form.setValue("tripType", value)}
            className="-mx-5 -mt-5 mb-1 rounded-t-md border-b border-border sm:-mx-6 sm:-mt-6 md:rounded-t-md"
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
                  label="From"
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
                stopFeePerStop={settings?.stopFee || 0}
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
                    label="To"
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

          <Button type="submit" className="bg-secondary text-white hover:bg-secondary-600" isLoading={calculateRoute.isPending}>
            Find Ride
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Step1;
