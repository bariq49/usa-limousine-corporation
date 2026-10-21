import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, { message: "First name must be at least 2 characters." })
    .max(60, { message: "First name must be at most 60 characters." }),
  lastName: z
    .string()
    .trim()
    .min(2, { message: "Last name must be at least 2 characters." })
    .max(60, { message: "Last name must be at most 60 characters." }),
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4, { message: "Your password must be at least 4 characters." }),
  terms: z
    .boolean()
    .refine((value) => value, { message: "You must accept the Terms & Conditions." }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
