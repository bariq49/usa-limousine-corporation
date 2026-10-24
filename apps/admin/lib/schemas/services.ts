import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  image: z.string().optional().nullable().or(z.literal("")),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  type: z.enum(["CHILD_SEAT", "EXTRA"] as const),
  maxQuantity: z.coerce.number().int().min(1, "Must be at least 1"),
  description: z.string().max(500).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export type Schema = z.infer<typeof serviceSchema>;
export type ServiceSchema = Schema;
