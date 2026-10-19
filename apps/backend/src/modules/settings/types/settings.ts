import type { PaymentMode } from "@prisma/client";

export type UpdateData = {
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
};

export type OfferMarketplaceSettings = {
  radius: number;
  expandStep: number;
  expandMax: number;
  geoMatchCount: number;
  maxPerBooking: number;
  maxQuotesPerDriver: number;
  ttlMin: number;
  sessionTtlMin: number;
  quoteMinFactor: number;
  quoteMaxFactor: number;
};

export type CancelPolicySettings = {
  paymentTimeoutMin: number;
  cancelRefundBeforeStartPercent: number;
  cancelRefundAfterStartPercent: number;
  driverCancelRefundPercent: number;
  driverCancelReseek: boolean;
  pickupFreeWaitMin: number;
  noShowRefundPercent: number;
};
