"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Mail, User } from "@usa-limousine-corporation/ui/svg";
import { useBookingStore, useTotalPrice } from "@/store/use-booking-store";
import { usePlaceOrder } from "@/hooks/queries/use-place-order";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { TripExtrasFields } from "./trip-extras-fields";
import { LuggageDetailsField } from "./luggage-details-field";
import { MeetGreetField } from "./meet-greet-field";
import { AirportPickupField } from "./airport-pickup-field";
import { ReturnTripField } from "./return-trip-field";
import { formatPrice } from "@/lib/utils";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { TRIP_TYPES } from "@/constants/booking-constants";
import type { Step3FormValues } from "@/types/booking.types";

function Step3() {
  const hasHydrated = useHasHydrated();
  const { step1, step3, setStep3Data } = useBookingStore();
  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();
  const totalPrice = useTotalPrice();

  const showReturnTrip = step1?.tripType !== TRIP_TYPES.HOURLY;

  const form = useForm<Step3FormValues>({
    defaultValues: {
      firstName: step3?.firstName ?? "",
      lastName: step3?.lastName ?? "",
      phone: step3?.phone ?? "",
      email: step3?.email ?? "",
      airlineName: step3?.airlineName ?? "",
      flightNumber: step3?.flightNumber ?? "",
      notes: step3?.notes ?? "",
      notesEnabled: Boolean(step3?.notes?.trim()),
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
      returnNotes: step3?.returnNotes ?? "",
      returnNotesEnabled: Boolean(step3?.returnNotes?.trim()),
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
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        email: values.email,
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
        returnNotes: returnEnabled
          ? values.returnNotes.trim() || undefined
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

  const handleSubmit = async () => {
    await placeOrder();
  };

  if (!hasHydrated) return null;

  return (
    <div className="flex flex-col animate-in fade-in duration-500 md:border border-border rounded-sm md:shadow-md px-3 py-5 md:px-6 md:py-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-6"
        >
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 tracking-tight px-1">
              Lead Passenger Details
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                name="firstName"
                placeholder="First Name"
                icon={<User width={16} height={16} className="text-gray-400" />}
                required
              />
              <Input
                name="lastName"
                placeholder="Last Name"
                icon={<User width={16} height={16} className="text-gray-400" />}
                required
              />
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
            </div>

            <LuggageDetailsField />
            {step1?.tripType !== TRIP_TYPES.HOURLY ? <AirportPickupField /> : null}
            <MeetGreetField />
            <TripExtrasFields />
            {showReturnTrip ? <ReturnTripField /> : null}
          </div>

          <Button
            type="submit"
            className="mt-4 rounded-sm bg-secondary text-white hover:bg-secondary-600"
            isLoading={isPending}
          >
            Continue to Book — {formatPrice(totalPrice)}
          </Button>
        </form>
      </Form>
    </div>
  );
}

export default Step3;
