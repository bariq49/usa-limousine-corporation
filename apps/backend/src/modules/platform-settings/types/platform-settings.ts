import type { NoticeUnit, PaymentMode } from "@prisma/client";

/** Platform settings as plain numbers, ready for pricing and API responses. */
export type PlatformRates = {
  paymentMode: PaymentMode;
  fuelSurchargeRate: number;
  gratuityRate: number;
  taxRate: number;
  transactionFeeRate: number;
  oneWayDiscountRate: number;
  returnDiscountRate: number;
  airportPickupFee: number;
  stopFee: number;
  meetAndGreetFee: number;
  minBookingNotice: number;
  minBookingNoticeUnit: NoticeUnit;
  /** `minBookingNotice` converted to minutes. */
  minBookingMinutes: number;
};

/** One leg of a trip priced from its base fare. */
export type LegQuote = {
  basePrice: number;
  fuelSurchargeAmount: number;
  gratuityAmount: number;
  taxAmount: number;
  transactionFeeAmount: number;
  priceBeforeDiscount: number;
  discountRate: number;
  discountAmount: number;
  airportFeeAmount: number;
  total: number;
};

/** Per-leg breakdown returned with vehicle prices so the website can show the fare. */
export type PriceBreakdown = {
  oneWayBasePrice: number;
  oneWaySurchargePercentage: number;
  oneWaySurchargeAmount: number;
  oneWayGratuityPercentage: number;
  oneWayGratuityAmount: number;
  oneWayTaxPercentage: number;
  oneWayTaxAmount: number;
  oneWayTransactionFeePercentage: number;
  oneWayTransactionFeeAmount: number;
  oneWayDiscountPercentage: number;
  oneWayDiscountAmount: number;
  oneWayAirportFeeAmount: number;
  oneWayPriceBeforeDiscount: number;
  oneWayTotalPrice: number;
  returnBasePrice: number;
  returnSurchargePercentage: number;
  returnSurchargeAmount: number;
  returnGratuityPercentage: number;
  returnGratuityAmount: number;
  returnTaxPercentage: number;
  returnTaxAmount: number;
  returnTransactionFeePercentage: number;
  returnTransactionFeeAmount: number;
  returnDiscountPercentage: number;
  returnDiscountAmount: number;
  returnAirportFeeAmount: number;
  returnPriceBeforeDiscount: number;
  returnTotalPrice: number;
};

/** Pricing stored on a booking: the amounts charged and the rates used at booking time. */
export type BookingPricing = {
  basePrice: number;
  fuelSurchargePrice: number;
  gratuityPrice: number;
  taxPrice: number;
  transactionFeePrice: number;
  discountPrice: number;
  airportPickupPrice: number;
  stopsPrice: number;
  meetAndGreetPrice: number;
  extraServicesPrice: number;
  total: number;
  rates: {
    fuelSurchargeRate: number;
    gratuityRate: number;
    taxRate: number;
    transactionFeeRate: number;
    oneWayDiscountRate: number;
    returnDiscountRate: number;
  };
};

export type BookingPricingInput = {
  /** Base fare for one leg, from the distance pricing. */
  basePrice: number;
  rates: PlatformRates;
  isAirport: boolean;
  isReturn: boolean;
  stopsCount: number;
  /** Legs with meet & greet (0, 1 or 2). */
  meetAndGreetLegs: number;
  /** Child seats, luggage and other selected extras. */
  extraServicesPrice: number;
};
