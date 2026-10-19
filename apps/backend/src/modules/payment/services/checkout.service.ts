import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PaymentStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import type { Request } from "express";
import { auditLog } from "../../../common/utils/audit-log";
import { toRequestContext } from "../../../common/utils/to-request-context";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { StripeService } from "../../../infrastructure/stripe/stripe.service";
import { getCheckoutConfig } from "../config/payment-checkout.config";
import { PAYMENT_CURRENCY } from "../constants/payment.constants";
import { PaymentRepository } from "../repositories/payment.repository";
import { ValidatorRegistry } from "./validator.registry";
import { assertSupportedPurpose } from "../utils/checkout-validation";
import type { CheckoutInput, CheckoutSnapshot, MethodSnapshot } from "../types/payment";

@Injectable()
export class CheckoutService {
  constructor(
    @Inject(PaymentRepository) private readonly paymentRepository: PaymentRepository,
    @Inject(StripeService) private readonly stripeService: StripeService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(ValidatorRegistry)
    private readonly validators: ValidatorRegistry,
  ) {}

  async createSession(input: CheckoutInput, request?: Request) {
    const checkoutConfig = getCheckoutConfig(this.configService);
    const successUrl = input.successUrl?.trim() || checkoutConfig.successUrl;
    const cancelUrl = input.cancelUrl?.trim() || checkoutConfig.cancelUrl;

    if (!successUrl || !cancelUrl) {
      throw new BadRequestException(
        "Checkout successUrl and cancelUrl are required (body or PAYMENT_CHECKOUT_* env)",
      );
    }

    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new BadRequestException("Payment amount must be a positive number");
    }

    const unitAmount = new Decimal(input.amount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).mul(100);
    if (!unitAmount.isInteger() || unitAmount.lte(0)) {
      throw new BadRequestException("Invalid payment amount");
    }

    assertSupportedPurpose(input.purpose);
    await this.validators.validate(input);

    const method: MethodSnapshot = { provider: "stripe" };
    const prepareInput = {
      purpose: input.purpose,
      referenceId: input.referenceId,
      amount: input.amount,
      method,
    };
    if (input.transactionId !== undefined) {
      Object.assign(prepareInput, { transactionId: input.transactionId });
    }

    const { payment, created } = await this.paymentRepository.prepareForCheckout(prepareInput);

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

      const amountCents = unitAmount.toFixed(0);
      const idempotencyKey = `checkout:${payment.id}:${amountCents}`;
      const stripe = await this.stripeService.getClientForSettings();
      const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: payment.id,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: PAYMENT_CURRENCY,
              unit_amount: unitAmount.toNumber(),
              product_data: { name: input.description },
            },
          },
        ],
        metadata,
        payment_intent_data: { metadata },
      };

      if (input.savePaymentMethod) {
        sessionParams.payment_intent_data = {
          metadata,
          setup_future_usage: "off_session",
        };
        if (input.customerId) {
          sessionParams.customer = input.customerId;
        } else {
          sessionParams.customer_creation = "always";
        }
      } else if (input.customerId) {
        sessionParams.customer = input.customerId;
      }

      const session = await stripe.checkout.sessions.create(sessionParams, { idempotencyKey });

      if (!session.url) {
        throw new BadRequestException("Stripe did not return a checkout URL");
      }

      const checkout: CheckoutSnapshot = {
        sessionId: session.id,
        checkoutUrl: session.url,
        idempotencyKey,
      };

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      if (paymentIntentId) {
        checkout.paymentIntentId = paymentIntentId;
      }

      await this.paymentRepository.update(payment.id, {
        status: PaymentStatus.PENDING,
        checkout,
        method,
      });

      if (request) {
        await auditLog({
          prisma: this.prisma,
          event: "payment.checkout_session_created",
          result: "success",
          context: toRequestContext(request),
          metadata: {
            paymentId: payment.id,
            purpose: input.purpose,
            referenceId: input.referenceId,
            sessionId: session.id,
          },
        });
      }

      return {
        paymentId: payment.id,
        checkoutUrl: session.url,
        sessionId: session.id,
      };
    } catch (error) {
      if (created) {
        await this.paymentRepository.deleteById(payment.id).catch(() => undefined);
      }
      throw error;
    }
  }
}
