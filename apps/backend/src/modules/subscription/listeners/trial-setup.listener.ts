import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import type { SetupCompletedPayload } from "../../payment/types/payment";
import { SubscriptionService } from "../services/subscription.service";

@Injectable()
export class SubscriptionTrialSetupListener {
  constructor(@Inject(SubscriptionService) private readonly subscriptions: SubscriptionService) {}

  @OnEvent("payment_method.setup_completed")
  async onSetupCompleted(payload: SetupCompletedPayload) {
    if (payload.metadata["subscriptionTrialSetup"] !== "true") {
      return;
    }

    const subscriptionId = payload.metadata["subscriptionId"];
    if (!subscriptionId) {
      return;
    }

    await this.subscriptions.attachPaymentMethod(subscriptionId, {
      customerId: payload.customerId,
      paymentMethodId: payload.paymentMethodId,
    });
    await this.subscriptions.activateTrialAfterSetup(subscriptionId);
  }
}
