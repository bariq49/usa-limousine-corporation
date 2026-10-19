import { z } from "zod";

export const verifySchema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  token: z.string().length(6, { message: "Enter the 6 digit confirmation code." }),
});

export type VerifySchema = z.infer<typeof verifySchema>;
