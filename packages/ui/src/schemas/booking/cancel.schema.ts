import { z } from "zod";

export const cancelBookingSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Please share a cancellation reason")
    .max(1000, "Reason must be at most 1000 characters"),
});

export type CancelBookingSchema = z.infer<typeof cancelBookingSchema>;
