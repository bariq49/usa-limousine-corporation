import { Inject, Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PaymentPurpose } from "@prisma/client";
import { PaymentRepository } from "../../payment/repositories/payment.repository";
import type { EventPayload } from "../../payment/types/events";
import type { MethodSnapshot } from "../../payment/types/payment";
import { SubscriptionService } from "../services/subscription.service";

const SUBSCRIPTION_PURPOSES = new Set<PaymentPurpose>([
  PaymentPurpose.DRIVER_SUBSCRIPTION,
  PaymentPurpose.AGENCY_SUBSCRIPTION,
]);

@Injectable()
export class SubscriptionPaymentListener {
  constructor(
    @Inject(SubscriptionService) private readonly subscriptions: SubscriptionService,
    @Inject(PaymentRepository) private readonly payments: PaymentRepository,
  ) {}

  @OnEvent("payment.succeeded")
  async onPaymentSucceeded(payload: EventPayload) {
    if (!SUBSCRIPTION_PURPOSES.has(payload.purpose)) {
      return;
    }

    await this.subscriptions.onPaid(payload.referenceId);

    const payment = await this.payments.findById(payload.id);
    const method = (payment?.method ?? null) as MethodSnapshot | null;
    if (method?.customerId || method?.paymentMethodId) {
      await this.subscriptions.attachPaymentMethod(payload.referenceId, {
        customerId: method.customerId,
        paymentMethodId: method.paymentMethodId,
      });
    }
  }
}
