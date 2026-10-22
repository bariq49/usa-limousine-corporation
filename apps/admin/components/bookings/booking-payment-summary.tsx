"use client";

import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import type { ExtraServiceItem, Item, Pricing } from "@/lib/types/bookings";

type Props = {
  booking: Pick<Item, "pricing" | "totalPrice" | "extraServices" | "luggage">;
};

function row(label: string, amount: number) {
  if (!amount || amount <= 0) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-default-600">{label}</span>
      <span className="font-semibold text-default-900">{formatPrice({ price: amount })}</span>
    </div>
  );
}

function serviceRows(services: ExtraServiceItem[] | null | undefined) {
  return (services ?? [])
    .filter((item) => item.quantity > 0)
    .map((item) => {
      const amount = item.unitPrice * item.quantity;
      const name = item.extraService?.name || "Extra service";
      const label = item.quantity > 1 ? `${name} ×${item.quantity}` : name;
      return (
        <div key={item.id} className="flex items-center justify-between gap-4">
          <span className="text-default-600">{label}</span>
          <span className="font-semibold text-default-900">{formatPrice({ price: amount })}</span>
        </div>
      );
    });
}

export function BookingPaymentSummary(props: Props) {
  const pricing = (props.booking.pricing ?? {}) as Pricing;
  const luggage = (props.booking.luggage ?? []).filter(
    (item) => item.quantity > 0 && item.unitPrice > 0,
  );

  return (
    <section className="rounded-md bg-default-100 p-4">
      <h3 className="text-base font-bold text-default-900 sm:text-lg">Payment Summary</h3>
      <div className="mt-3 space-y-2.5 text-sm sm:mt-4">
        {row("Base Price", Number(pricing.basePrice ?? 0))}
        {row("Additional Stops", Number(pricing.stopsPrice ?? 0))}
        {row("Airport Pickup", Number(pricing.airportPickupPrice ?? 0))}
        {serviceRows(props.booking.extraServices)}
        {luggage.map((item) => {
          const amount = item.unitPrice * item.quantity;
          const label =
            item.quantity > 1
              ? `${item.luggageType?.name || "Luggage"} ×${item.quantity}`
              : item.luggageType?.name || "Luggage";
          return (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <span className="text-default-600">{label}</span>
              <span className="font-semibold text-default-900">
                {formatPrice({ price: amount })}
              </span>
            </div>
          );
        })}
        {pricing.subtotal != null && Number(pricing.subtotal) !== Number(pricing.total)
          ? row("Subtotal", Number(pricing.subtotal))
          : null}
        <div className="mt-1 flex items-center justify-between gap-4 border-t border-border pt-3">
          <span className="text-base font-bold text-default-900">Total</span>
          <span className="text-lg font-bold text-default-900">
            {formatPrice({ price: props.booking.totalPrice })}
          </span>
        </div>
      </div>
    </section>
  );
}
