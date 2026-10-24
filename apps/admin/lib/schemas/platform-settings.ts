import { z } from "zod";

const rate = z.coerce
  .number({ invalid_type_error: "Enter a number" })
  .min(0, "Cannot be negative")
  .max(100, "Cannot exceed 100%");

const amount = z.coerce
  .number({ invalid_type_error: "Enter a number" })
  .min(0, "Cannot be negative");

export const platformSettingsSchema = z.object({
  livePaymentMode: z.boolean(),
  fuelSurchargeRate: rate,
  gratuityRate: rate,
  taxRate: rate,
  transactionFeeRate: rate,
  oneWayDiscountRate: rate,
  returnDiscountRate: rate,
  airportPickupFee: amount,
  stopFee: amount,
  meetAndGreetFee: amount,
  minBookingNotice: z.coerce.number().int("Whole numbers only").min(0, "Cannot be negative"),
  minBookingNoticeUnit: z.enum(["HOUR", "MINUTE"] as const),
});

export type Schema = z.infer<typeof platformSettingsSchema>;
