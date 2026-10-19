import { BadRequestException, Injectable } from "@nestjs/common";
import type { PaymentPurpose } from "@prisma/client";
import type { CheckoutInput } from "../types/payment";
import type { PurposeValidator } from "../types/checkout-validator";

@Injectable()
export class ValidatorRegistry {
  private readonly validators = new Map<PaymentPurpose, PurposeValidator>();

  register(validator: PurposeValidator) {
    this.validators.set(validator.purpose, validator);
  }

  async validate(input: CheckoutInput): Promise<void> {
    const validator = this.validators.get(input.purpose);
    if (!validator) {
      throw new BadRequestException(`No checkout validator registered for ${input.purpose}`);
    }
    await validator.validate(input);
  }
}
