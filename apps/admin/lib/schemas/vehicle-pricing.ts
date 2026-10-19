import { z } from "zod";
import { APP_DISTANCE_UNIT } from "@usa-limousine-corporation/ui/constants";

export const vehiclePricingSchema = z
  .object({
    vehicleCategoryId: z.string().min(1, "Vehicle category is required"),
    minimumDistance: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({
          required_error: "Minimum distance is required",
          invalid_type_error: "Minimum distance is required",
        })
        .min(0, "Minimum distance must be at least 0"),
    ),
    maximumDistance: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z.number().min(0, "Maximum distance must be at least 0").nullable().optional(),
    ),
    pricingType: z.enum(["FIXED", "PER_UNIT", "PERCENTAGE"]),
    basePrice: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({
          required_error: "Base price is required",
          invalid_type_error: "Base price is required",
        })
        .min(0, "Base price must be at least 0"),
    ),
    perUnitRate: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z.number().min(0, `Rate per ${APP_DISTANCE_UNIT} must be at least 0`).nullable().optional(),
    ),
    percentageRate: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? null : Number(val)),
      z.number().min(0, "Increase percentage must be at least 0").nullable().optional(),
    ),
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  })
  .refine(
    (data) => {
      if (data.maximumDistance !== null && data.maximumDistance !== undefined) {
        return data.maximumDistance > data.minimumDistance;
      }
      return true;
    },
    {
      message: "Maximum distance must be greater than minimum distance",
      path: ["maximumDistance"],
    },
  )
  .refine(
    (data) => {
      if (data.pricingType === "PER_UNIT") {
        return data.perUnitRate !== null && data.perUnitRate !== undefined && data.perUnitRate >= 0;
      }
      return true;
    },
    {
      message: `Rate per ${APP_DISTANCE_UNIT} is required`,
      path: ["perUnitRate"],
    },
  );

export type Schema = z.infer<typeof vehiclePricingSchema>;
