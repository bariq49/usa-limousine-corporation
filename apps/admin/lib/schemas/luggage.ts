import { z } from "zod";

export const luggageSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  description: z.string().max(500).optional().or(z.literal("")),
  dimensions: z.string().max(100).optional().or(z.literal("")),
  image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  price: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.coerce.number().min(0, "Price cannot be negative").optional().nullable(),
  ),
  isActive: z.boolean().default(true),
});

export type Schema = z.infer<typeof luggageSchema>;
export type LuggageSchema = Schema;
