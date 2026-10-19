import { z } from "zod";

export const personalDetailsSchema = z.object({
  firstName: z.string().trim().min(1, { message: "First name is required." }).max(60),
  lastName: z.string().trim().max(60).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  email: z.string().email({ message: "Your email is invalid." }),
  name: z.string().optional(),
});

export type PersonalDetailsSchema = z.infer<typeof personalDetailsSchema>;
