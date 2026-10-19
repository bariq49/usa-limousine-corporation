import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PaymentStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { AppLogger } from "../../../common/logger/app.logger";
import { StripeService } from "../../../infrastructure/stripe/stripe.service";
import { OutboxService } from "./outbox.service";
import { OutboxRepository } from "../repositories/outbox.repository";
import { PaymentRepository } from "../repositories/payment.repository";
import { PAYMENT_CURRENCY } from "../constants/payment.constants";
import type { MethodSnapshot, OffSessionChargeInput } from "../types/payment";

@Injectable()
export class ChargeService {
  constructor(
    @Inject(PaymentRepository) private readonly payments: PaymentRepository,
    @Inject(OutboxRepository) private readonly outbox: OutboxRepository,
    @Inject(StripeService) private readonly stripe: StripeService,
    @Inject(OutboxService) private readonly outboxService: OutboxService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async tryOffSession(input: OffSessionChargeInput) {
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new BadRequestException("Payment amount must be a positive number");
    }

    const unitAmount = new Decimal(input.amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).mul(100);
    if (!unitAmount.isInteger() || unitAmount.lte(0)) {
      throw new BadRequestException("Invalid payment amount");
    }

    const method: MethodSnapshot = {
      provider: "stripe",
      customerId: input.customerId,
      paymentMethodId: input.paymentMethodId,
    };
    const { payment, created } = await this.payments.prepareForCheckout({
      purpose: input.purpose,
      referenceId: input.referenceId,
      amount: input.amount,
      method,
      transactionId: `offsession:${input.referenceId}`,
    });

    try {
      const metadata: Record<string, string> = {
        paymentId: payment.id,
        purpose: input.purpose,
        referenceId: input.referenceId,
      };
      if (input.metadata) {
        for (const key of Object.keys(input.metadata)) {
          metadata[key] = input.metadata[key]!;
        }
      }

      const client = await this.stripe.getClientForSettings();
      const intent = await client.paymentIntents.create(
        {
          amount: unitAmount.toNumber(),
          currency: PAYMENT_CURRENCY,
          customer: input.customerId,
          payment_method: input.paymentMethodId,
          off_session: true,
          confirm: true,
          description: input.description,
          metadata,
        },
        { idempotencyKey: `offsession:${payment.id}` },
      );

      if (intent.status !== "succeeded") {
        if (created) {
          await this.payments.deleteById(payment.id).catch(() => undefined);
        }
        return { ok: false };
      }

      const { outbox } = await this.outbox.commit({
        paymentId: payment.id,
        event: "payment.succeeded",
        payload: {
          id: payment.id,
          purpose: input.purpose,
          referenceId: input.referenceId,
          status: PaymentStatus.SUCCEEDED,
        },
        data: {
          status: PaymentStatus.SUCCEEDED,
          paidAt: new Date(),
          failureCode: null,
          failureMessage: null,
          cancelledAt: null,
          method: {
            provider: "stripe",
            customerId: input.customerId,
            paymentMethodId: input.paymentMethodId,
            paidAt: new Date().toISOString(),
          },
          checkout: { paymentIntentId: intent.id },
        },
      });
      await this.outboxService.enqueueDispatch(outbox.id);
      return { ok: true, paymentId: payment.id };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Off-session charge failed: ${message}`, ChargeService.name);
      if (created) {
        await this.payments.deleteById(payment.id).catch(() => undefined);
      }
      return { ok: false };
    }
  }
}
