import { BadRequestException, Inject, Injectable, type OnModuleInit } from "@nestjs/common";
import { PaymentPurpose, SubscriptionStatus } from "@prisma/client";
import type { PurposeValidator } from "../../payment/types/checkout-validator";
import { ValidatorRegistry } from "../../payment/services/validator.registry";
import { SubscriptionRepository } from "../repositories/subscription.repository";
import { toAmount } from "../../../common/utils/money";

const ACTIVATE_STATUSES: SubscriptionStatus[] = [
  SubscriptionStatus.INCOMPLETE,
  SubscriptionStatus.PAST_DUE,
];

const SUBSCRIPTION_PURPOSES = [
  PaymentPurpose.DRIVER_SUBSCRIPTION,
  PaymentPurpose.AGENCY_SUBSCRIPTION,
] as const;

@Injectable()
export class SubscriptionCheckoutRegistrar implements OnModuleInit {
  constructor(
    @Inject(ValidatorRegistry) private readonly registry: ValidatorRegistry,
    @Inject(SubscriptionRepository) private readonly subscriptions: SubscriptionRepository,
  ) {}

  onModuleInit() {
    const validate: PurposeValidator["validate"] = async (input) => {
      const sub = await this.subscriptions.findById({ id: input.referenceId });
      if (!sub) {
        throw new BadRequestException("Subscription not found for checkout");
      }

      const amount = toAmount(input.amount);

      if (sub.pendingPlanId && sub.pendingChargeAmount != null) {
        const expected = toAmount(sub.pendingChargeAmount);
        if (amount !== expected) {
          throw new BadRequestException("Checkout amount does not match upgrade charge");
        }
        return;
      }

      if (!ACTIVATE_STATUSES.includes(sub.status)) {
        throw new BadRequestException("Subscription is not awaiting checkout");
      }

      const expected = toAmount(sub.plan.amount);
      if (amount !== expected) {
        throw new BadRequestException("Checkout amount does not match plan price");
      }
    };

    for (const purpose of SUBSCRIPTION_PURPOSES) {
      this.registry.register({ purpose, validate });
    }
  }
}
