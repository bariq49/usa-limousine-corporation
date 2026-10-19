import { z } from "zod";

export const forgotSchema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
});

export type ForgotSchema = z.infer<typeof forgotSchema>;
