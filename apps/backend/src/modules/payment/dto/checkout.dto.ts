import { Matches } from "class-validator";

export class CheckoutOrderParamDto {
  @Matches(/^[A-Za-z0-9]{10,64}$/, { message: "Invalid checkout order" })
  orderId!: string;
}
