"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Calendar, ChevronRight, Clock, Mail, User } from "@usa-limousine-corporation/ui/svg";
import { useBookingStore, useTotalPrice } from "@/store/use-booking-store";
import { usePlaceOrder } from "@/hooks/queries/use-place-order";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { TripExtrasFields } from "./trip-extras-fields";
import { LuggageDetailsField } from "./luggage-details-field";
import { CcEmailField } from "./cc-email-field";
import { MeetGreetField } from "./meet-greet-field";
import { AirportPickupField } from "./airport-pickup-field";
import { ReturnTripField } from "./return-trip-field";
import BookingStepActions from "../booking-step-actions";
import { formatPrice, validateBookingTime } from "@/lib/utils";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { PASSENGER_TITLES, TRIP_TYPES } from "@/constants/booking-constants";
import type { Step3FormValues } from "@/types/booking.types";

/** Lets the copy of the submit button in the mobile summary sheet submit this form. */
const PASSENGER_FORM_ID = "passenger-details-form";

function Step3() {
  const hasHydrated = useHasHydrated();
  const { step1, step3, bookingSettings, setStep3Data } = useBookingStore();
  const { mutate: placeOrder, isPending } = usePlaceOrder();
  const totalPrice = useTotalPrice();

  const showReturnTrip = step1?.tripType !== TRIP_TYPES.HOURLY;

  const form = useForm<Step3FormValues>({
    defaultValues: {
      title: step3?.title ?? PASSENGER_TITLES[0].value,
      fullName: step3?.fullName ?? "",
      phone: step3?.phone ?? "",
      email: step3?.email ?? "",
      ccEmailEnabled: Boolean(step3?.ccEmail),
      ccEmail: step3?.ccEmail ?? "",
      pickupDate: step3?.pickupDate ?? "",
      pickupTime: step3?.pickupTime ?? "",
      airlineName: step3?.airlineName ?? "",
      flightNumber: step3?.flightNumber ?? "",
      notes: step3?.notes ?? "",
      luggage: step3?.luggage ?? [],
      meetGreetEnabled: Boolean(step3?.meetGreetEnabled),
      meetGreet: step3?.meetGreet ?? "",
      childSeatsEnabled: Boolean(
        step3?.childSeats?.some((seat) => seat.quantity > 0)
      ),
      childSeats: step3?.childSeats ?? [],
      returnEnabled: showReturnTrip ? Boolean(step3?.returnEnabled) : false,
      returnDate: step3?.returnDate ?? "",
      returnTime: step3?.returnTime ?? "",
      returnAirlineName: step3?.returnAirlineName ?? "",
      returnFlightNumber: step3?.returnFlightNumber ?? "",
      returnMeetGreetEnabled: Boolean(step3?.returnMeetGreetEnabled),
      returnMeetGreet: step3?.returnMeetGreet ?? "",
      returnChildSeatsEnabled: Boolean(
        step3?.returnChildSeats?.some((seat) => seat.quantity > 0)
      ),
      returnChildSeats: step3?.returnChildSeats ?? [],
    },
  });

  useEffect(() => {
    const persist = () => {
      const values = form.getValues();
      const returnEnabled = showReturnTrip && values.returnEnabled;

      setStep3Data({
        title: values.title,
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        ccEmail: values.ccEmailEnabled ? values.ccEmail.trim() || undefined : undefined,
        pickupDate: values.pickupDate,
        pickupTime: values.pickupTime,
        airlineName: values.airlineName.trim() || undefined,
        flightNumber: values.flightNumber.trim() || undefined,
        meetGreetEnabled: values.meetGreetEnabled,
        meetGreet: values.meetGreetEnabled
          ? values.meetGreet.trim() || undefined
          : undefined,
        notes: values.notes.trim() || undefined,
        luggage: values.luggage.filter((item) => item.quantity > 0),
        childSeats: values.childSeats.filter((seat) => seat.quantity > 0),
        returnEnabled,
        returnDate: returnEnabled ? values.returnDate.trim() || undefined : undefined,
        returnTime: returnEnabled ? values.returnTime.trim() || undefined : undefined,
        returnAirlineName:
          returnEnabled && step1?.isAirportSelected
            ? values.returnAirlineName.trim() || undefined
            : undefined,
        returnFlightNumber:
          returnEnabled && step1?.isAirportSelected
            ? values.returnFlightNumber.trim() || undefined
            : undefined,
        returnMeetGreetEnabled: returnEnabled && values.returnMeetGreetEnabled,
        returnMeetGreet:
          returnEnabled && values.returnMeetGreetEnabled
            ? values.returnMeetGreet.trim() || undefined
            : undefined,
        returnChildSeats: returnEnabled
          ? values.returnChildSeats.filter((seat) => seat.quantity > 0)
          : [],
      });
    };

    persist();
    const subscription = form.watch(() => persist());
    return () => subscription.unsubscribe();
  }, [form, setStep3Data, showReturnTrip, step1?.isAirportSelected]);

  const handleSubmit = (values: Step3FormValues) => {
    const pickupValidation = validateBookingTime({
      date: values.pickupDate,
      time: values.pickupTime,
      minBookingMinutes: bookingSettings?.minBookingMinutes ?? 0,
    });

    if (!pickupValidation.isValid) {
      toast.error(
        `Booking can't be added within ${pickupValidation.timeDisplay} of pickup time, choose another time.`,
      );
      return;
    }

    placeOrder();
  };

  if (!hasHydrated) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 md:border border-border rounded-sm md:shadow-md px-3 py-5 md:px-6 md:py-6">
      <Form {...form}>
        <form
          id={PASSENGER_FORM_ID}
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight px-1">
              Lead Passenger Details
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex gap-3 sm:col-span-2">
                <Input
                  name="title"
                  type="select"
                  placeholder="Title"
                  options={PASSENGER_TITLES}
                  className="w-28 shrink-0"
                />
                <Input
                  name="fullName"
                  placeholder="Full Name"
                  icon={<User width={16} height={16} className="text-gray-400" />}
                  className="flex-1"
                  required
                />
              </div>
              <Input
                name="email"
                type="email"
                placeholder="Email Address"
                icon={<Mail width={16} height={16} className="text-gray-400" />}
                required
              />
              <Input
                name="phone"
                type="phone"
                placeholder="Phone Number"
                required
              />
              <Input
                name="pickupDate"
                type="date"
                placeholder="Pickup Date"
                icon={<Calendar width={16} height={16} className="text-gray-400" />}
                disablePast
                required
              />
              <Input
                name="pickupTime"
                type="time"
                placeholder="Pickup Time"
                icon={<Clock width={16} height={16} className="text-gray-400" />}
                required
              />
            </div>

            <CcEmailField />
            <LuggageDetailsField />
            {step1?.tripType !== TRIP_TYPES.HOURLY ? <AirportPickupField /> : null}
            <MeetGreetField />
            <TripExtrasFields />
            {showReturnTrip ? <ReturnTripField /> : null}
          </div>

          <BookingStepActions backHref="/book-ride/select-vehicle">
            <Button
              type="submit"
              form={PASSENGER_FORM_ID}
              isLoading={isPending}
              className="h-11 flex-1 gap-2 rounded-sm bg-black font-semibold text-white hover:bg-black/90"
            >
              Continue to Book — {formatPrice(totalPrice)}
              <ChevronRight width={16} height={16} strokeWidth={2.5} />
            </Button>
          </BookingStepActions>
        </form>
      </Form>
    </div>
  );
}

export default Step3;
