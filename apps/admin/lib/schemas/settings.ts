import { z } from "zod";

export const settingsSchema = z
  .object({
    paymentMode: z.enum(["TEST", "LIVE"]),
    payoutMin: z.coerce
      .number({ invalid_type_error: "Minimum payout must be a number" })
      .min(0.01, "Minimum payout must be at least 0.01"),
    payoutIntervalDays: z.coerce
      .number({ invalid_type_error: "Payout interval must be a number" })
      .int("Payout interval must be a whole number of days")
      .min(1, "Payout interval must be at least 1 day"),
    requireSubscription: z.boolean().default(false),
    offerRadius: z.coerce
      .number({ invalid_type_error: "Matching radius must be a number" })
      .min(0.5, "Matching radius must be at least 0.5 km")
      .max(100, "Matching radius cannot exceed 100 km"),
    offerExpandStep: z.coerce
      .number({ invalid_type_error: "Expand step must be a number" })
      .min(0.5, "Expand step must be at least 0.5 km")
      .max(50, "Expand step cannot exceed 50 km"),
    offerExpandMax: z.coerce
      .number({ invalid_type_error: "Max radius must be a number" })
      .min(1, "Max radius must be at least 1 km")
      .max(200, "Max radius cannot exceed 200 km"),
    offerGeoMatchCount: z.coerce
      .number({ invalid_type_error: "Geo match count must be a number" })
      .int("Geo match count must be a whole number")
      .min(1, "Geo match count must be at least 1")
      .max(500, "Geo match count cannot exceed 500"),
    offerMaxPerBooking: z.coerce
      .number({ invalid_type_error: "Max offers must be a number" })
      .int("Max offers must be a whole number")
      .min(1, "Max offers must be at least 1")
      .max(100, "Max offers cannot exceed 100"),
    offerMaxQuotesPerDriver: z.coerce
      .number({ invalid_type_error: "Max quotes must be a number" })
      .int("Max quotes must be a whole number")
      .min(1, "Max quotes must be at least 1")
      .max(50, "Max quotes cannot exceed 50"),
    offerTtlMin: z.coerce
      .number({ invalid_type_error: "Offer TTL must be a number" })
      .int("Offer TTL must be a whole number of minutes")
      .min(1, "Offer TTL must be at least 1 minute")
      .max(60, "Offer TTL cannot exceed 60 minutes"),
    offerSessionTtlMin: z.coerce
      .number({ invalid_type_error: "Session TTL must be a number" })
      .int("Session TTL must be a whole number of minutes")
      .min(1, "Session TTL must be at least 1 minute")
      .max(180, "Session TTL cannot exceed 180 minutes"),
    offerQuoteMinFactor: z.coerce
      .number({ invalid_type_error: "Min quote factor must be a number" })
      .min(0.1, "Min quote factor must be at least 0.1")
      .max(1, "Min quote factor cannot exceed 1"),
    offerQuoteMaxFactor: z.coerce
      .number({ invalid_type_error: "Max quote factor must be a number" })
      .min(1, "Max quote factor must be at least 1")
      .max(5, "Max quote factor cannot exceed 5"),
    paymentTimeoutMin: z.coerce
      .number({ invalid_type_error: "Payment timeout must be a number" })
      .int("Payment timeout must be a whole number of minutes")
      .min(1)
      .max(180),
    cancelRefundBeforeStartPercent: z.coerce
      .number({ invalid_type_error: "Refund % must be a number" })
      .int()
      .min(0)
      .max(100),
    cancelRefundAfterStartPercent: z.coerce
      .number({ invalid_type_error: "Refund % must be a number" })
      .int()
      .min(0)
      .max(100),
    driverCancelRefundPercent: z.coerce
      .number({ invalid_type_error: "Refund % must be a number" })
      .int()
      .min(0)
      .max(100),
    driverCancelReseek: z.boolean().default(false),
    pickupFreeWaitMin: z.coerce
      .number({ invalid_type_error: "Free wait must be a number" })
      .int()
      .min(0)
      .max(120),
    noShowRefundPercent: z.coerce
      .number({ invalid_type_error: "Refund % must be a number" })
      .int()
      .min(0)
      .max(100),
  })
  .superRefine((values, ctx) => {
    if (values.offerExpandMax < values.offerRadius) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offerExpandMax"],
        message: "Max radius must be ≥ default matching radius",
      });
    }
    if (values.offerQuoteMaxFactor <= values.offerQuoteMinFactor) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offerQuoteMaxFactor"],
        message: "Max quote factor must be greater than min quote factor",
      });
    }
    if (values.offerSessionTtlMin < values.offerTtlMin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offerSessionTtlMin"],
        message: "Session TTL should be at least offer TTL",
      });
    }
  });

export type Schema = z.infer<typeof settingsSchema>;
