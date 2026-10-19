import { Inject, Injectable } from "@nestjs/common";
import { PaymentMode, PaymentStatus } from "@prisma/client";
import { AppLogger } from "../../../common/logger/app.logger";
import { StripeService } from "../../../infrastructure/stripe/stripe.service";
import { OutboxService } from "./outbox.service";
import { OutboxRepository } from "../repositories/outbox.repository";
import { WebhookRepository } from "../repositories/webhook.repository";
import type { CheckoutSnapshot, MethodSnapshot } from "../types/payment";
import type {
  CommitInput,
  ResolveInput,
  StripeCharge,
  StripeCheckoutSession,
  StripeEvent,
  StripePaymentIntent,
  SucceededInput,
  WebhookBody,
  WebhookResult,
} from "../types/webhook";
import { PaymentMethodService } from "./payment-method.service";
import { RefundService } from "./refund.service";

@Injectable()
export class WebhookService {
  constructor(
    @Inject(WebhookRepository) private readonly webhookRepository: WebhookRepository,
    @Inject(OutboxRepository) private readonly outboxRepository: OutboxRepository,
    @Inject(StripeService) private readonly stripeService: StripeService,
    @Inject(RefundService) private readonly refundService: RefundService,
    @Inject(PaymentMethodService) private readonly paymentMethods: PaymentMethodService,
    @Inject(OutboxService)
    private readonly outboxService: OutboxService,
    @Inject(AppLogger) private readonly logger: AppLogger,
  ) {}

  async handleStripeWebhook(rawBody: WebhookBody, signature: string): Promise<WebhookResult> {
    const event = this.stripeService.constructWebhookEvent(rawBody, signature);

    const isNew = await this.webhookRepository.tryRecordEvent(event.id, event.type);
    if (!isNew) {
      return { received: true, ignored: true };
    }

    try {
      await this.processEvent(event);
      return { received: true };
    } catch (error) {
      await this.webhookRepository.deleteEvent(event.id);
      throw error;
    }
  }

  private async processEvent(event: StripeEvent) {
    if (event.type === "checkout.session.completed") {
      await this.onCheckoutSessionCompleted(event.data.object as StripeCheckoutSession);
      return;
    }

    if (event.type === "checkout.session.expired") {
      await this.onCheckoutSessionExpired(event.data.object as StripeCheckoutSession);
      return;
    }

    if (event.type === "setup_intent.succeeded") {
      await this.onSetupIntentSucceeded(event.data.object as { id?: string });
      return;
    }

    if (event.type === "payment_intent.succeeded") {
      await this.onPaymentIntentSucceeded(event.data.object as StripePaymentIntent);
      return;
    }

    if (event.type === "payment_intent.payment_failed") {
      await this.onPaymentIntentFailed(event.data.object as StripePaymentIntent);
      return;
    }

    if (event.type === "charge.refunded") {
      await this.refundService.handleChargeRefunded(event.data.object as StripeCharge);
    }
  }

  private async onCheckoutSessionCompleted(session: StripeCheckoutSession) {
    if (session.mode === "setup") {
      await this.onSetupSessionCompleted(session);
      return;
    }

    const payment = await this.findPaymentForSession(session);
    if (!payment || payment.status === PaymentStatus.SUCCEEDED) {
      return;
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    const existing = (payment.checkout ?? {}) as CheckoutSnapshot;
    const checkout: CheckoutSnapshot = { sessionId: session.id };
    if (existing.checkoutUrl !== undefined) {
      checkout.checkoutUrl = existing.checkoutUrl;
    }
    if (existing.idempotencyKey !== undefined) {
      checkout.idempotencyKey = existing.idempotencyKey;
    }
    if (paymentIntentId) {
      checkout.paymentIntentId = paymentIntentId;
    }

    const existingMethod = (payment.method ?? { provider: "stripe" }) as MethodSnapshot;
    const resolveInput: ResolveInput = {
      existing: existingMethod,
      livemode: session.livemode,
    };
    if (paymentIntentId !== undefined) {
      resolveInput.paymentIntentId = paymentIntentId;
    }
    const method = await this.resolveMethod(resolveInput);

    await this.commitSucceeded({
      paymentId: payment.id,
      purpose: payment.purpose,
      referenceId: payment.referenceId,
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
        failureCode: null,
        failureMessage: null,
        cancelledAt: null,
        checkout,
        method,
      },
    });
  }

  private async onSetupSessionCompleted(session: StripeCheckoutSession) {
    if (!session.id) {
      return;
    }
    try {
      await this.paymentMethods.completeSetupSession(session.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Setup session complete failed: ${message}`, WebhookService.name);
      throw error;
    }
  }

  private async onSetupIntentSucceeded(intent: { id?: string }) {
    if (!intent.id) {
      return;
    }
    try {
      await this.paymentMethods.completeSetupIntent(intent.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Setup intent complete failed: ${message}`, WebhookService.name);
      throw error;
    }
  }

  private async onPaymentIntentSucceeded(intent: StripePaymentIntent) {
    const paymentId = intent.metadata?.["paymentId"];
    if (!paymentId) {
      return;
    }

    const payment = await this.webhookRepository.findById(paymentId);
    if (!payment || payment.status === PaymentStatus.SUCCEEDED) {
      return;
    }

    const existing = (payment.checkout ?? {}) as CheckoutSnapshot;
    const checkout: CheckoutSnapshot = {
      ...existing,
      paymentIntentId: intent.id,
    };
    const existingMethod = (payment.method ?? { provider: "stripe" }) as MethodSnapshot;
    const method = await this.resolveMethod({
      existing: existingMethod,
      livemode: intent.livemode,
      paymentIntentId: intent.id,
    });

    await this.commitSucceeded({
      paymentId: payment.id,
      purpose: payment.purpose,
      referenceId: payment.referenceId,
      data: {
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
        failureCode: null,
        failureMessage: null,
        cancelledAt: null,
        checkout,
        method,
      },
    });
  }

  private async resolveMethod(input: ResolveInput) {
    const method: MethodSnapshot = {
      provider: input.existing.provider ?? "stripe",
      paidAt: new Date().toISOString(),
    };

    if (!input.paymentIntentId) {
      return method;
    }

    try {
      const mode = input.livemode ? PaymentMode.LIVE : PaymentMode.TEST;
      const intent = await this.stripeService
        .getClient(mode)
        .paymentIntents.retrieve(input.paymentIntentId, {
          expand: ["payment_method"],
        });

      const paymentMethod = intent.payment_method;
      if (typeof intent.customer === "string" && intent.customer) {
        method.customerId = intent.customer;
      } else if (
        intent.customer &&
        typeof intent.customer === "object" &&
        "id" in intent.customer
      ) {
        method.customerId = (intent.customer as { id: string }).id;
      }

      if (!paymentMethod) {
        return method;
      }
      if (typeof paymentMethod === "string") {
        method.paymentMethodId = paymentMethod;
        return method;
      }

      method.paymentMethodId = paymentMethod.id;
      method.type = paymentMethod.type;
      const card = paymentMethod.card;
      if (card) {
        if (card.brand) {
          method.brand = card.brand;
        }
        if (card.last4) {
          method.last4 = card.last4;
        }
        if (card.exp_month !== undefined) {
          method.expMonth = card.exp_month;
        }
        if (card.exp_year !== undefined) {
          method.expYear = card.exp_year;
        }
        if (card.fingerprint) {
          method.fingerprint = card.fingerprint;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Stripe payment method lookup failed for ${input.paymentIntentId}: ${message}`,
        WebhookService.name,
      );
    }

    return method;
  }

  private async onCheckoutSessionExpired(session: StripeCheckoutSession) {
    const payment = await this.findPaymentForSession(session);
    if (payment?.status !== PaymentStatus.PENDING) {
      return;
    }

    await this.commitEvent({
      paymentId: payment.id,
      data: {
        status: PaymentStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      event: "payment.failed",
      payload: {
        id: payment.id,
        purpose: payment.purpose,
        referenceId: payment.referenceId,
        status: PaymentStatus.CANCELLED,
      },
    });
  }

  private async onPaymentIntentFailed(intent: StripePaymentIntent) {
    const paymentId = intent.metadata?.["paymentId"];
    if (!paymentId) {
      return;
    }

    const payment = await this.webhookRepository.findById(paymentId);
    if (!payment || payment.status === PaymentStatus.SUCCEEDED) {
      return;
    }

    await this.commitEvent({
      paymentId: payment.id,
      data: {
        status: PaymentStatus.FAILED,
        failureCode: intent.last_payment_error?.code ?? "payment_failed",
        failureMessage: intent.last_payment_error?.message ?? "Stripe payment intent failed",
      },
      event: "payment.failed",
      payload: {
        id: payment.id,
        purpose: payment.purpose,
        referenceId: payment.referenceId,
        status: PaymentStatus.FAILED,
      },
    });
  }

  private async commitSucceeded(input: SucceededInput) {
    await this.commitEvent({
      paymentId: input.paymentId,
      data: input.data,
      event: "payment.succeeded",
      payload: {
        id: input.paymentId,
        purpose: input.purpose,
        referenceId: input.referenceId,
        status: PaymentStatus.SUCCEEDED,
      },
    });
  }

  private async commitEvent(input: CommitInput) {
    const { outbox } = await this.outboxRepository.commit({
      paymentId: input.paymentId,
      data: input.data,
      event: input.event,
      payload: input.payload,
    });

    try {
      await this.outboxService.enqueueDispatch(outbox.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Outbox enqueue failed for ${outbox.id} (payment ${input.paymentId}); drain will retry: ${message}`,
        WebhookService.name,
      );
    }
  }

  private async findPaymentForSession(session: StripeCheckoutSession) {
    const paymentId = session.metadata?.["paymentId"] ?? session.client_reference_id;
    if (paymentId) {
      return this.webhookRepository.findById(paymentId);
    }
    return this.webhookRepository.findByCheckoutSessionId(session.id);
  }
}
