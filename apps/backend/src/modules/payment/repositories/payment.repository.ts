import { randomInt } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { BookingStatus, type PaymentMode, PaymentStatus, Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CheckoutResult } from "../../../infrastructure/stripe/types/stripe";
import type { CheckoutBooking } from "../types/payment";

@Injectable()
export class PaymentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  recordPaid(booking: CheckoutBooking, result: CheckoutResult, mode: PaymentMode) {
    const now = new Date();
    return this.record(
      {
        bookingId: booking.id,
        status: PaymentStatus.PAID,
        mode,
        amount: result.amount,
        currency: result.currency,
        transactionId: transactionId(),
        stripePaymentIntentId: result.transactionId,
        stripeSessionId: result.sessionId,
        cardBrand: result.cardBrand,
        cardLast4: result.cardLast4,
        customerName: booking.passenger.name,
        customerEmail: booking.passenger.email,
        customerPhone: booking.passenger.phone,
        paidAt: now,
      },
      { status: BookingStatus.CONFIRMED, confirmedAt: now },
    );
  }

  recordCancelled(booking: CheckoutBooking, result: CheckoutResult, mode: PaymentMode) {
    return this.record(
      {
        bookingId: booking.id,
        status: PaymentStatus.CANCELLED,
        mode,
        amount: result.amount,
        currency: result.currency,
        stripeSessionId: result.sessionId,
        customerName: booking.passenger.name,
        customerEmail: booking.passenger.email,
        customerPhone: booking.passenger.phone,
      },
      {
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: "Payment was not completed",
      },
    );
  }

  private async record(
    payment: Prisma.PaymentUncheckedCreateInput,
    booking: Prisma.BookingUncheckedUpdateInput,
  ) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const updated = await tx.booking.updateMany({
          where: { id: payment.bookingId, status: BookingStatus.PENDING },
          data: booking,
        });
        if (updated.count === 0) return false;

        await tx.payment.create({ data: payment });
        return true;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return false;
      }
      throw error;
    }
  }
}

function transactionId() {
  return `TID-${Date.now().toString().slice(-8)}${randomInt(1000, 10000)}`;
}
