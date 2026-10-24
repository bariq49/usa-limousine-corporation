import { Matches } from "class-validator";

export class CheckoutSessionParamDto {
  @Matches(/^cs_(test|live)_[A-Za-z0-9]+$/, { message: "Invalid checkout session" })
  sessionId!: string;
}
