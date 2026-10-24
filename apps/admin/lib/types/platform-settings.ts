export type NoticeUnit = "HOUR" | "MINUTE";
export type PaymentMode = "TEST" | "LIVE";

/** Platform-wide fees and booking rules. Rates are percentages of the base fare. */
export type PlatformSettings = {
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
  minBookingMinutes: number;
};

export type UpdatePayload = Partial<Omit<PlatformSettings, "minBookingMinutes">>;
