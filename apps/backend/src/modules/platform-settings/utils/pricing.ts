import { roundAmount } from "../../../common/utils/money";
import type {
  BookingPricing,
  BookingPricingInput,
  LegQuote,
  PlatformRates,
  PriceBreakdown,
} from "../types/platform-settings";

function percentOf(amount: number, rate: number): number {
  return roundAmount((amount * rate) / 100);
}

/**
 * Prices one leg: surcharge, gratuity, tax and transaction fee are percentages of the base;
 * the leg discount comes off that subtotal, then the airport fee is added.
 */
export function quoteLeg(
  basePrice: number,
  discountRate: number,
  rates: PlatformRates,
  isAirport: boolean,
): LegQuote {
  const base = roundAmount(basePrice);
  const fuelSurchargeAmount = percentOf(base, rates.fuelSurchargeRate);
  const gratuityAmount = percentOf(base, rates.gratuityRate);
  const taxAmount = percentOf(base, rates.taxRate);
  const transactionFeeAmount = percentOf(base, rates.transactionFeeRate);
  const priceBeforeDiscount = roundAmount(
    base + fuelSurchargeAmount + gratuityAmount + taxAmount + transactionFeeAmount,
  );
  const discountAmount = percentOf(priceBeforeDiscount, discountRate);
  const airportFeeAmount = isAirport ? roundAmount(rates.airportPickupFee) : 0;

  return {
    basePrice: base,
    fuelSurchargeAmount,
    gratuityAmount,
    taxAmount,
    transactionFeeAmount,
    priceBeforeDiscount,
    discountRate,
    discountAmount,
    airportFeeAmount,
    total: roundAmount(priceBeforeDiscount - discountAmount + airportFeeAmount),
  };
}

/** One-way and return leg prices for a vehicle, as shown on the website. */
export function priceBreakdown(
  basePrice: number,
  rates: PlatformRates,
  isAirport: boolean,
): PriceBreakdown {
  const oneWay = quoteLeg(basePrice, rates.oneWayDiscountRate, rates, isAirport);
  const back = quoteLeg(basePrice, rates.returnDiscountRate, rates, isAirport);

  return {
    oneWayBasePrice: oneWay.basePrice,
    oneWaySurchargePercentage: rates.fuelSurchargeRate,
    oneWaySurchargeAmount: oneWay.fuelSurchargeAmount,
    oneWayGratuityPercentage: rates.gratuityRate,
    oneWayGratuityAmount: oneWay.gratuityAmount,
    oneWayTaxPercentage: rates.taxRate,
    oneWayTaxAmount: oneWay.taxAmount,
    oneWayTransactionFeePercentage: rates.transactionFeeRate,
    oneWayTransactionFeeAmount: oneWay.transactionFeeAmount,
    oneWayDiscountPercentage: rates.oneWayDiscountRate,
    oneWayDiscountAmount: oneWay.discountAmount,
    oneWayAirportFeeAmount: oneWay.airportFeeAmount,
    oneWayPriceBeforeDiscount: oneWay.priceBeforeDiscount,
    oneWayTotalPrice: oneWay.total,
    returnBasePrice: back.basePrice,
    returnSurchargePercentage: rates.fuelSurchargeRate,
    returnSurchargeAmount: back.fuelSurchargeAmount,
    returnGratuityPercentage: rates.gratuityRate,
    returnGratuityAmount: back.gratuityAmount,
    returnTaxPercentage: rates.taxRate,
    returnTaxAmount: back.taxAmount,
    returnTransactionFeePercentage: rates.transactionFeeRate,
    returnTransactionFeeAmount: back.transactionFeeAmount,
    returnDiscountPercentage: rates.returnDiscountRate,
    returnDiscountAmount: back.discountAmount,
    returnAirportFeeAmount: back.airportFeeAmount,
    returnPriceBeforeDiscount: back.priceBeforeDiscount,
    returnTotalPrice: back.total,
  };
}

/**
 * Full booking price: the outbound leg (one-way discount) and the return leg when booked
 * (return discount) for each vehicle, then stop fees, meet & greet per leg, and selected extras.
 */
export function bookingPricing(input: BookingPricingInput): BookingPricing {
  const { rates } = input;
  const oneWay = quoteLeg(input.basePrice, rates.oneWayDiscountRate, rates, input.isAirport);
  const back = quoteLeg(input.basePrice, rates.returnDiscountRate, rates, input.isAirport);
  const legs = Array.from({ length: Math.max(1, input.vehicleCount ?? 1) }).flatMap(() =>
    input.isReturn ? [oneWay, back] : [oneWay],
  );

  const sum = (pick: (leg: LegQuote) => number) =>
    roundAmount(legs.reduce((total, leg) => total + pick(leg), 0));

  const stopsPrice = roundAmount(rates.stopFee * input.stopsCount);
  const meetAndGreetPrice = roundAmount(rates.meetAndGreetFee * input.meetAndGreetLegs);
  const extraServicesPrice = roundAmount(input.extraServicesPrice);
  const legsTotal = sum((leg) => leg.total);

  return {
    basePrice: sum((leg) => leg.basePrice),
    fuelSurchargePrice: sum((leg) => leg.fuelSurchargeAmount),
    gratuityPrice: sum((leg) => leg.gratuityAmount),
    taxPrice: sum((leg) => leg.taxAmount),
    transactionFeePrice: sum((leg) => leg.transactionFeeAmount),
    discountPrice: sum((leg) => leg.discountAmount),
    airportPickupPrice: sum((leg) => leg.airportFeeAmount),
    stopsPrice,
    meetAndGreetPrice,
    extraServicesPrice,
    total: roundAmount(legsTotal + stopsPrice + meetAndGreetPrice + extraServicesPrice),
    rates: {
      fuelSurchargeRate: rates.fuelSurchargeRate,
      gratuityRate: rates.gratuityRate,
      taxRate: rates.taxRate,
      transactionFeeRate: rates.transactionFeeRate,
      oneWayDiscountRate: rates.oneWayDiscountRate,
      returnDiscountRate: rates.returnDiscountRate,
    },
  };
}
