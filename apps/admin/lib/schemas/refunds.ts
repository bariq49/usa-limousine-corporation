import { z } from "zod";

export const completeRefundSchema = z.object({
  manual: z.boolean().default(false),
  reason: z
    .string()
    .trim()
    .max(500, "Reason cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type CompleteRefundSchema = z.infer<typeof completeRefundSchema>;

export const rejectRefundSchema = z.object({
  manual: z.boolean().default(false),
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required to reject a refund")
    .max(500, "Reason cannot exceed 500 characters"),
});

export type RejectRefundSchema = z.infer<typeof rejectRefundSchema>;

export const refundPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  manual: z.boolean().default(false),
  reason: z
    .string()
    .trim()
    .max(500, "Reason cannot exceed 500 characters")
    .optional()
    .or(z.literal("")),
});

export type RefundPaymentSchema = z.infer<typeof refundPaymentSchema>;
