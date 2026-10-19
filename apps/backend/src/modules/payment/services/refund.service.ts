import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { PaymentPurpose, PaymentStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { roundAmount, toAmount } from "../../../common/utils/money";
import { StripeService } from "../../../infrastructure/stripe/stripe.service";
import { PaymentRepository } from "../repositories/payment.repository";
import type { StripeCharge } from "../types/webhook";

@Injectable()
export class RefundService {
  constructor(
    @Inject(PaymentRepository) private readonly paymentRepository: PaymentRepository,
    @Inject(StripeService) private readonly stripe: StripeService,
  ) {}

  async handleChargeRefunded(charge: StripeCharge) {
    const paymentId = charge.metadata?.["paymentId"];
    if (!paymentId) {
      return;
    }

    const payment = await this.paymentRepository.findById(paymentId);
    if (!payment) {
      return;
    }

    const refundedCents = charge.amount_refunded ?? 0;
    const refundedAmount = new Decimal(refundedCents).div(100).toDecimalPlaces(4);
    const paymentAmount = new Decimal(payment.amount).toDecimalPlaces(4);
    const status = refundedAmount.gte(paymentAmount)
      ? PaymentStatus.REFUNDED
      : PaymentStatus.PARTIALLY_REFUNDED;

    await this.paymentRepository.update(payment.id, {
      status,
      refundedAmount,
      refundedAt: new Date(),
    });
  }

  async refundBookingPercent(bookingId: string, percent: number) {
    const clamped = Math.min(100, Math.max(0, percent));
    const payment = await this.paymentRepository.findByReference(PaymentPurpose.BOOKING, bookingId);
    if (!payment) {
      return { refundedNow: 0, payment: null, percent: clamped };
    }
    if (
      payment.status !== PaymentStatus.SUCCEEDED &&
      payment.status !== PaymentStatus.PARTIALLY_REFUNDED
    ) {
      throw new BadRequestException("Payment is not refundable in its current status");
    }

    const total = toAmount(payment.amount);
    const already = toAmount(payment.refundedAmount);
    const target = roundAmount((total * clamped) / 100);
    const additional = roundAmount(Math.max(0, target - already));
    if (additional <= 0) {
      return { refundedNow: 0, payment, percent: clamped };
    }

    const checkout = (payment.checkout ?? {}) as { paymentIntentId?: string };
    const paymentIntentId = checkout.paymentIntentId;
    if (!paymentIntentId) {
      throw new BadRequestException("Payment has no Stripe payment intent to refund");
    }

    const cents = Math.round(additional * 100);
    const client = await this.stripe.getClientForSettings();
    await client.refunds.create(
      {
        payment_intent: paymentIntentId,
        amount: cents,
        metadata: {
          paymentId: payment.id,
          bookingId,
          percent: String(clamped),
        },
      },
      { idempotencyKey: `refund:${payment.id}:${clamped}:${cents}` },
    );

    const newRefunded = roundAmount(already + additional);
    const status =
      newRefunded >= total - 0.001 ? PaymentStatus.REFUNDED : PaymentStatus.PARTIALLY_REFUNDED;

    const updated = await this.paymentRepository.update(payment.id, {
      status,
      refundedAmount: newRefunded,
      refundedAt: new Date(),
    });

    return { refundedNow: additional, payment: updated, percent: clamped };
  }
}
