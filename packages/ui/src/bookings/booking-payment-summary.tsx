"use client";

import { formatPrice } from "../utils/price";
import type { ExtraServiceItem, Item, LegPricing, Pricing } from "./types";

type Props = {
  booking: Pick<Item, "pricing" | "totalPrice" | "extraServices" | "luggage" | "bookingType">;
};

function row(label: string, amount: number, discount = false) {
  if (!amount || amount <= 0) return null;

  return (
    <div className="flex items-center justify-between gap-4">
      <span className={discount ? "text-destructive" : "text-default-600"}>{label}</span>
      <span
        className={discount ? "font-semibold text-destructive" : "font-semibold text-default-900"}
      >
        {discount ? "- " : ""}
        {formatPrice({ price: amount })}
      </span>
    </div>
  );
}

function serviceRows(
  services: ExtraServiceItem[] | null | undefined,
  prefix: string,
  quantityOf: (item: ExtraServiceItem) => number,
) {
  return (services ?? [])
    .filter((item) => quantityOf(item) > 0)
    .map((item) => {
      const quantity = quantityOf(item);
      const amount = item.unitPrice * quantity;
      const name = `${prefix}${item.extraService?.name || "Extra service"}`;
      const label = quantity > 1 ? `${name} ×${quantity}` : name;
      return (
        <div key={`${prefix}${item.id}`} className="flex items-center justify-between gap-4">
          <span className="text-default-600">{label}</span>
          <span className="font-semibold text-default-900">{formatPrice({ price: amount })}</span>
        </div>
      );
    });
}

export function BookingPaymentSummary(props: Props) {
  const pricing = (props.booking.pricing ?? {}) as Pricing;
  const rates = pricing.rates;
  const rate = (value: number | undefined) => (rates && value != null ? ` (${value}%)` : "");
  const discountRate =
    rates && props.booking.bookingType === "RETURN"
      ? ` (${rates.oneWayDiscountRate}% / ${rates.returnDiscountRate}%)`
      : rate(rates?.oneWayDiscountRate);
  const legRows = (prefix: string, leg: LegPricing, legDiscountRate: number | undefined) => (
    <>
      {row(`${prefix}Base Price`, Number(leg.basePrice))}
      {row(
        `${prefix}Fuel Surcharge${rate(rates?.fuelSurchargeRate)}`,
        Number(leg.fuelSurchargePrice),
      )}
      {row(`${prefix}Gratuity${rate(rates?.gratuityRate)}`, Number(leg.gratuityPrice))}
      {row(`${prefix}Tax${rate(rates?.taxRate)}`, Number(leg.taxPrice))}
      {row(
        `${prefix}Transaction Fee${rate(rates?.transactionFeeRate)}`,
        Number(leg.transactionFeePrice),
      )}
      {row(`${prefix}Discount${rate(legDiscountRate)}`, Number(leg.discountPrice), true)}
      {row(`${prefix}Airport Pickup`, Number(leg.airportPickupPrice))}
      {row(`${prefix}Meet & Greet`, Number(leg.meetAndGreetPrice ?? 0))}
    </>
  );
  const luggage = (props.booking.luggage ?? []).filter(
    (item) => item.quantity > 0 && item.unitPrice > 0,
  );

  return (
    <section className="rounded-md bg-default-100 p-4">
      <h3 className="text-base font-bold text-default-900 sm:text-lg">Payment Summary</h3>
      <div className="mt-3 space-y-2.5 text-sm sm:mt-4">
        {pricing.legs ? (
          <>
            {legRows("", pricing.legs.oneWay, rates?.oneWayDiscountRate)}
            {serviceRows(props.booking.extraServices, "", (item) => item.quantity)}
            {legRows("Return ", pricing.legs.returnTrip, rates?.returnDiscountRate)}
            {serviceRows(
              props.booking.extraServices,
              "Return ",
              (item) => item.returnQuantity ?? 0,
            )}
          </>
        ) : (
          <>
            {row("Base Price", Number(pricing.basePrice ?? 0))}
            {row(
              `Fuel Surcharge${rate(rates?.fuelSurchargeRate)}`,
              Number(pricing.fuelSurchargePrice ?? 0),
            )}
            {row(`Gratuity${rate(rates?.gratuityRate)}`, Number(pricing.gratuityPrice ?? 0))}
            {row(`Tax${rate(rates?.taxRate)}`, Number(pricing.taxPrice ?? 0))}
            {row(
              `Transaction Fee${rate(rates?.transactionFeeRate)}`,
              Number(pricing.transactionFeePrice ?? 0),
            )}
            {row(`Discount${discountRate}`, Number(pricing.discountPrice ?? 0), true)}
            {row("Airport Pickup", Number(pricing.airportPickupPrice ?? 0))}
            {row("Meet & Greet", Number(pricing.meetAndGreetPrice ?? 0))}
            {serviceRows(
              props.booking.extraServices,
              "",
              (item) => item.quantity + (item.returnQuantity ?? 0),
            )}
          </>
        )}
        {row("Additional Stops", Number(pricing.stopsPrice ?? 0))}
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
