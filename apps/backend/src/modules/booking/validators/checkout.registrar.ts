import { Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { ValidatorRegistry } from "../../payment/services/validator.registry";
import { CheckoutValidator } from "./checkout.validator";

@Injectable()
export class CheckoutRegistrar implements OnModuleInit {
  constructor(
    @Inject(ValidatorRegistry) private readonly registry: ValidatorRegistry,
    @Inject(CheckoutValidator) private readonly validator: CheckoutValidator,
  ) {}

  onModuleInit() {
    this.registry.register(this.validator);
  }
}
