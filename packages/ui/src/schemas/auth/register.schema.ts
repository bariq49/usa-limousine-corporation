import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4, { message: "Your password must be at least 4 characters." }),
  terms: z
    .boolean()
    .refine((value) => value, { message: "You must accept the Terms & Conditions." }),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
