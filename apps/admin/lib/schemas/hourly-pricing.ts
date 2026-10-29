import { z } from "zod";
import { APP_DISTANCE_UNIT } from "@usa-limousine-corporation/ui/constants";

export const hourlyPricingSchema = z.object({
  vehicleCategoryId: z.string().min(1, "Vehicle category is required"),
  durationHours: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({
        required_error: "Duration is required",
        invalid_type_error: "Duration is required",
      })
      .int("Duration must be in whole hours")
      .min(1, "Duration must be at least 1 hour")
      .max(168, "Duration cannot exceed 168 hours"),
  ),
  basePrice: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z
      .number({
        required_error: "Price is required",
        invalid_type_error: "Price is required",
      })
      .min(0, "Price must be at least 0"),
  ),
  includedDistance: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0, "Included distance must be at least 0"),
  ),
  extraDistanceRate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? 0 : Number(val)),
    z.number().min(0, `Rate per ${APP_DISTANCE_UNIT} must be at least 0`),
  ),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

export type Schema = z.infer<typeof hourlyPricingSchema>;
