export type PaymentMode = "TEST" | "LIVE";

export interface Get {
  paymentMode: PaymentMode;
  payoutMin: number;
  payoutIntervalDays: number;
  requireSubscription: boolean;
  offerRadius: number;
  offerExpandStep: number;
  offerExpandMax: number;
  offerGeoMatchCount: number;
  offerMaxPerBooking: number;
  offerMaxQuotesPerDriver: number;
  offerTtlMin: number;
  offerSessionTtlMin: number;
  offerQuoteMinFactor: number;
  offerQuoteMaxFactor: number;
  paymentTimeoutMin: number;
  cancelRefundBeforeStartPercent: number;
  cancelRefundAfterStartPercent: number;
  driverCancelRefundPercent: number;
  driverCancelReseek: boolean;
  pickupFreeWaitMin: number;
  noShowRefundPercent: number;
  updatedAt: string;
}

export interface Update {
  paymentMode?: PaymentMode;
  payoutMin?: number;
  payoutIntervalDays?: number;
  requireSubscription?: boolean;
  offerRadius?: number;
  offerExpandStep?: number;
  offerExpandMax?: number;
  offerGeoMatchCount?: number;
  offerMaxPerBooking?: number;
  offerMaxQuotesPerDriver?: number;
  offerTtlMin?: number;
  offerSessionTtlMin?: number;
  offerQuoteMinFactor?: number;
  offerQuoteMaxFactor?: number;
  paymentTimeoutMin?: number;
  cancelRefundBeforeStartPercent?: number;
  cancelRefundAfterStartPercent?: number;
  driverCancelRefundPercent?: number;
  driverCancelReseek?: boolean;
  pickupFreeWaitMin?: number;
  noShowRefundPercent?: number;
}
