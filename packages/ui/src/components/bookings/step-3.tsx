"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ChevronRight, Mail, Plane, User } from "../../svg";
import { useBookingStore, useTotalPrice } from "../../store/booking";
import { useHasHydrated, usePlaceOrder } from "../../hooks/use-booking";
import { Button } from "../button";
import { Form } from "../form";
import { Input } from "../input";
import { TripExtrasFields } from "./trip-extras-fields";
import { LuggageDetailsField } from "./luggage-details-field";
import { CcEmailField } from "./cc-email-field";
import { MeetGreetField } from "./meet-greet-field";
import { ReturnTripField } from "./return-trip-field";
import { NotificationsField } from "./notifications-field";
import BookingStepActions from "./booking-step-actions";
import { PASSENGER_TITLES, TRIP_TYPES } from "../../constants/booking";
import type { Step3FormValues } from "../../types/booking";
import { isAirport } from "../../utils/location";
import { formatPrice } from "../../utils/price";

const PASSENGER_FORM_ID = "passenger-details-form";

function Step3() {
  const hasHydrated = useHasHydrated();
  const { step1, returnTrip, step3, setStep3 } = useBookingStore();
  const { mutate: placeOrder, isPending } = usePlaceOrder();
  const totalPrice = useTotalPrice();

  const showReturnTrip = step1?.tripType !== TRIP_TYPES.HOURLY;
  const airportTrip = Boolean(step1 &&
      isAirport({
        pickupAddress: step1.pickupAddress,
        deliveryAddress: step1.deliveryAddress,
      }),
  );
  const showFlightDetails = showReturnTrip && airportTrip;

  const form = useForm<Step3FormValues>({
    defaultValues: {
      title: step3?.title ?? PASSENGER_TITLES[0]!.value,
      fullName: step3?.fullName ?? "",
      phone: step3?.phone ?? "",
      email: step3?.email ?? "",
      ccEmailEnabled: Boolean(step3?.ccEmail),
      ccEmail: step3?.ccEmail ?? "",
      flightNumber: step3?.flightNumber ?? "",
      notes: step3?.notes ?? "",
      returnNotes: step3?.returnNotes ?? "",
      notifyByEmail: step3?.notifyByEmail ?? true,
      notifyBySms: step3?.notifyBySms ?? false,
      luggage: step3?.luggage ?? [],
      meetGreetEnabled: Boolean(step3?.meetGreetEnabled),
      meetGreet: step3?.meetGreet ?? "",
      childSeatsEnabled: Boolean(step3?.childSeats?.some((seat) => seat.quantity > 0)),
      childSeats: step3?.childSeats ?? [],
      returnFlightNumber: step3?.returnFlightNumber ?? "",
      returnMeetGreetEnabled: Boolean(step3?.returnMeetGreetEnabled),
      returnMeetGreet: step3?.returnMeetGreet ?? "",
      returnChildSeatsEnabled: Boolean(step3?.returnChildSeats?.some((seat) => seat.quantity > 0)),
      returnChildSeats: step3?.returnChildSeats ?? [],
    },
  });

  useEffect(() => {
    const persist = () => {
      const values = form.getValues();
      const returnEnabled = showReturnTrip && Boolean(returnTrip);

      setStep3({
        title: values.title,
        fullName: values.fullName,
        phone: values.phone,
        email: values.email,
        ccEmail: values.ccEmailEnabled ? values.ccEmail.trim() || undefined : undefined,
        flightNumber: values.flightNumber.trim() || undefined,
        meetGreetEnabled: values.meetGreetEnabled,
        meetGreet: values.meetGreetEnabled ? values.meetGreet.trim() || undefined : undefined,
        notes: values.notes.trim() || undefined,
        luggage: values.luggage.filter((item) => item.quantity > 0),
        childSeats: values.childSeats.filter((seat) => seat.quantity > 0),
        returnFlightNumber:
          returnEnabled && airportTrip
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
        returnNotes: returnEnabled ? (values.returnNotes ?? "").trim() || undefined : undefined,
        notifyByEmail: values.notifyByEmail ?? true,
        notifyBySms: values.notifyBySms ?? false,
      });
    };

    persist();
    const subscription = form.watch(() => persist());
    return () => subscription.unsubscribe();
  }, [form, setStep3, showReturnTrip, returnTrip, airportTrip]);

  const handleSubmit = (values: Step3FormValues) => {
    if (
      values.ccEmailEnabled &&
      values.ccEmail.trim().toLowerCase() === values.email.trim().toLowerCase()
    ) {
      form.setError("ccEmail", { message: "Enter a different email from the passenger email" });
      return;
    }

    placeOrder();
  };

  if (!hasHydrated) return null;

  return (
    <>
      <h1 className="mb-5 hidden text-3xl font-bold tracking-tight text-black md:block">
        Passenger details
      </h1>
      <div className="flex flex-col animate-in fade-in duration-500 px-3 py-5 md:px-0 md:py-0">
        <Form {...form}>
          <form
            id={PASSENGER_FORM_ID}
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="space-y-6">
              <h3 className="border-b border-border pb-3 text-lg font-semibold tracking-tight text-black">
                Booking details
              </h3>
              {showFlightDetails ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-normal leading-tight text-black">Flight number</p>
                    <p className="mt-1 text-xs text-gray-700">
                      Your driver will track your flight and adjust pickup time accordingly.
                    </p>
                  </div>
                  <Input
                    name="flightNumber"
                    placeholder="e.g. LH1868"
                    icon={<Plane width={20} height={20} className="rotate-90 text-black" />}
                    className="sm:max-w-sm"
                    required
                  />
                </div>
              ) : null}
              <div className="border-y border-border py-4">
                <TripExtrasFields />
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-semibold tracking-tight text-black">Lead passenger</h3>

              <div className="grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2">
                <div className="flex gap-3 sm:col-span-2">
                  <Input
                    name="title"
                    type="select"
                    label="Title"
                    placeholder="Title"
                    options={PASSENGER_TITLES}
                    className="w-28 shrink-0"
                  />
                  <Input
                    name="fullName"
                    label="Full Name"
                    placeholder="Enter Full Name"
                    icon={<User width={16} height={16} className="text-gray-400" />}
                    className="flex-1"
                    required
                  />
                </div>
                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="Enter Email Address"
                  icon={<Mail width={16} height={16} className="text-gray-400" />}
                  required
                />
                <Input
                  name="phone"
                  type="phone"
                  label="Phone Number"
                  placeholder="Enter Phone Number"
                  required
                />
                <CcEmailField className="contents" fieldClassName="sm:col-span-2 sm:order-last" />
                <MeetGreetField className="contents" fieldClassName="sm:col-span-2 sm:order-last" />
              </div>
            </div>

            <LuggageDetailsField />

            {showReturnTrip ? <ReturnTripField /> : null}

            <NotificationsField />

            <BookingStepActions backHref="/book-ride/select-vehicle">
              <Button
                type="submit"
                form={PASSENGER_FORM_ID}
                isLoading={isPending}
                disabled={totalPrice <= 0}
                className="h-11 flex-1 gap-2 rounded-sm bg-black font-semibold text-white hover:bg-black/90"
              >
                {totalPrice > 0
                  ? `Continue to Book — ${formatPrice({ price: totalPrice })}`
                  : "Pricing your trip..."}
                <ChevronRight width={16} height={16} strokeWidth={2.5} />
              </Button>
            </BookingStepActions>
          </form>
        </Form>

      </div>
    </>
  );
}

export default Step3;
