import type { NoticeUnit, PaymentMode } from "@prisma/client";

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
  emailNotificationFee: number;
  smsNotificationFee: number;
  minBookingNotice: number;
  minBookingNoticeUnit: NoticeUnit;
  minBookingMinutes: number;
  cancellationNotice: number;
  cancellationNoticeUnit: NoticeUnit;
  cancellationMinutes: number;
  cancellationRefundRate: number;
};

export type PricedLine = {
  type: "EXTRA_SERVICE" | "LUGGAGE";
  id: string;
  name: string;
  quantity: number;
  returnQuantity: number;
  unitPrice: number;
  total: number;
};

export type LegPricing = {
  basePrice: number;
  fuelSurchargePrice: number;
  gratuityPrice: number;
  taxPrice: number;
  transactionFeePrice: number;
  discountPrice: number;
  airportPickupPrice: number;
  meetAndGreetPrice: number;
  total: number;
};

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
  notificationsPrice: number;
  total: number;
  legs?: { oneWay: LegPricing; returnTrip: LegPricing };
  items?: PricedLine[];
  rates: {
    fuelSurchargeRate: number;
    gratuityRate: number;
    taxRate: number;
    transactionFeeRate: number;
    oneWayDiscountRate: number;
    returnDiscountRate: number;
  };
};
