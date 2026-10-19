import { z } from "zod";

export const createPasswordSchema = z
  .object({
    token: z.string().min(1, { message: "Enter the reset code from your email." }),
    password: z.string().min(4, { message: "Your password must be at least 4 characters." }),
    confirmPassword: z.string().min(4, { message: "Your password must be at least 4 characters." }),
    terms: z
      .boolean()
      .refine((value) => value, { message: "You must accept the Terms & Conditions." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type CreatePasswordSchema = z.infer<typeof createPasswordSchema>;
