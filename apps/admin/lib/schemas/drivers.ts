import { z } from "zod";

export const driverSchema = z.object({
  avatar: z.string().optional().nullable().or(z.literal("")),
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(32),
  vehicleCategoryId: z.string().min(1, "Vehicle category is required"),
  licenseNumber: z.string().trim().max(60).optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type Schema = z.infer<typeof driverSchema>;

export const assignSchema = z.object({
  driverId: z.string().min(1, "Select a driver"),
  commissionRate: z.coerce
    .number({ invalid_type_error: "Enter a number" })
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100%"),
  note: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type AssignSchema = z.infer<typeof assignSchema>;
