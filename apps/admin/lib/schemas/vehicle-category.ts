import { z } from "zod";

const luggageCapacitySchema = z.object({
  luggageTypeId: z.string().min(1, "Luggage type is required"),
  quantity: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().int().min(0, "Quantity cannot be negative").max(50, "Quantity cannot exceed 50"),
  ),
});

export const vehicleCategorySchema = z
  .object({
    name: z.string().min(1, "Name is required").max(80),
    description: z.string().max(500).optional().or(z.literal("")),
    image: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    passengerCount: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({
          required_error: "Passenger count is required",
          invalid_type_error: "Passenger count is required",
        })
        .int()
        .min(1, "At least 1 passenger")
        .max(100, "Cannot exceed 100 passengers"),
    ),
    isActive: z.boolean().default(true),
    standardLuggageCapacity: z.array(luggageCapacitySchema),
    specialLuggageCapacity: z.array(luggageCapacitySchema).optional().default([]),
  })
  .refine((data) => data.standardLuggageCapacity.some((item) => item.quantity > 0), {
    message: "Set quantity for at least one standard luggage type",
    path: ["standardLuggageCapacity"],
  });

export type Schema = z.infer<typeof vehicleCategorySchema>;
