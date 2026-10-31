import { Inject, Injectable } from "@nestjs/common";
import {
  BookingStatus,
  type PaymentMode,
  PaymentStatus,
  Prisma,
  RefundStatus,
} from "@prisma/client";
import { APIFeature } from "../../../common/api-feature";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { OrderResult } from "../../../infrastructure/square/types/square";
import type { QueryDto, RefundQueryDto } from "../dto/payment.dto";
import type { CheckoutBooking } from "../types/payment";

@Injectable()
export class PaymentRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  findMany(query: QueryDto, userId?: string) {
    const initialFilter: Prisma.PaymentWhereInput = {};
    if (userId) {
      initialFilter.booking = { userId };
    }

    const feature = new APIFeature(query, {
      initialFilter,
      filterFields: ["status", "mode"],
      search: {
        searchFields: [
          "transactionId",
          "squarePaymentId",
          "squareOrderId",
          "customerName",
          "customerEmail",
          "customerPhone",
        ],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "amount", "paidAt", "refundedAt", "status"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.payment.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: {
            booking: {
              select: {
                id: true,
                bookingNumber: true,
                status: true,
                bookingType: true,
                totalPrice: true,
                userId: true,
              },
            },
          },
        }),
      count: (args) => this.prisma.payment.count({ where: args.where as never }),
    });
  }

  findById(id: string) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            bookingType: true,
            totalPrice: true,
            userId: true,
          },
        },
        refunds: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  findRefunds(query: RefundQueryDto, userId?: string) {
    const initialFilter: Prisma.RefundWhereInput = {};
    if (userId) {
      initialFilter.booking = { userId };
    }

    const feature = new APIFeature(query, {
      initialFilter,
      filterFields: ["status"],
      search: {
        searchFields: ["reason", "refundNumber", "squareRefundId"],
      },
      sort: {
        allowedFields: ["createdAt", "updatedAt", "amount", "processedAt", "status", "refundNumber"],
        defaultSortBy: "createdAt",
        defaultSortOrder: "desc",
      },
      pagination: {
        defaultLimit: 20,
        maxLimit: 100,
      },
    });

    return feature.execute({
      findMany: (args) =>
        this.prisma.refund.findMany({
          where: args.where as never,
          orderBy: args.orderBy as never,
          skip: args.skip,
          take: args.take,
          include: {
            booking: {
              select: {
                id: true,
                bookingNumber: true,
                status: true,
                bookingType: true,
                totalPrice: true,
                userId: true,
              },
            },
            payment: {
              select: {
                id: true,
                transactionId: true,
                amount: true,
                currency: true,
                mode: true,
                status: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                cardBrand: true,
                cardLast4: true,
                squarePaymentId: true,
              },
            },
          },
        }),
      count: (args) => this.prisma.refund.count({ where: args.where as never }),
    });
  }

  findRefundById(id: string) {
    return this.prisma.refund.findUnique({
      where: { id },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            bookingType: true,
            totalPrice: true,
            userId: true,
          },
        },
        payment: {
          select: {
            id: true,
            transactionId: true,
            amount: true,
            currency: true,
            mode: true,
            status: true,
            customerName: true,
            customerEmail: true,
            customerPhone: true,
            cardBrand: true,
            cardLast4: true,
            squarePaymentId: true,
            refundedAmount: true,
          },
        },
      },
    });
  }

  createRefund(data: Prisma.RefundUncheckedCreateInput) {
    return this.prisma.refund.create({
      data,
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            userId: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            mode: true,
            squarePaymentId: true,
          },
        },
      },
    });
  }

  updateRefund(id: string, data: Prisma.RefundUncheckedUpdateInput) {
    return this.prisma.refund.update({
      where: { id },
      data,
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            userId: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            mode: true,
            squarePaymentId: true,
          },
        },
      },
    });
  }

  async completeRefund(
    refundId: string,
    data: {
      squareRefundId?: string | null;
      isManual: boolean;
      processedBy?: string | null;
    },
  ) {
    return this.prisma.$transaction(async (tx) => {
      const now = new Date();
      const updatedRefund = await tx.refund.update({
        where: { id: refundId },
        data: {
          status: RefundStatus.COMPLETED,
          isManual: data.isManual,
          squareRefundId: data.squareRefundId ?? null,
          processedAt: now,
          processedBy: data.processedBy ?? null,
        },
        include: {
          payment: true,
          booking: {
            select: {
              id: true,
              bookingNumber: true,
              status: true,
              userId: true,
            },
          },
        },
      });

      const allCompleted = await tx.refund.findMany({
        where: { paymentId: updatedRefund.paymentId, status: RefundStatus.COMPLETED },
        select: { amount: true },
      });
      const totalRefunded = allCompleted.reduce((sum, r) => sum + Number(r.amount), 0);

      const payment = updatedRefund.payment;
      const isFullyRefunded = totalRefunded >= Number(payment.amount);

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          refundedAmount: totalRefunded,
          refundedAt: now,
          squareRefundId: data.squareRefundId ?? payment.squareRefundId,
          status: isFullyRefunded ? PaymentStatus.REFUNDED : payment.status,
        },
      });

      return updatedRefund;
    });
  }

  recordRefund(
    id: string,
    data: { refundedAmount: number; refundedAt: Date; squareRefundId?: string | null },
  ) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        status: PaymentStatus.REFUNDED,
        refundedAmount: data.refundedAmount,
        refundedAt: data.refundedAt,
        squareRefundId: data.squareRefundId ?? null,
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingNumber: true,
            status: true,
            bookingType: true,
            totalPrice: true,
            userId: true,
          },
        },
      },
    });
  }

  recordPaid(
    booking: CheckoutBooking,
    result: OrderResult,
    mode: PaymentMode,
    transactionId?: string,
  ) {
    const now = new Date();
    return this.record(
      {
        bookingId: booking.id,
        status: PaymentStatus.PAID,
        mode,
        amount: result.amount,
        currency: result.currency,
        transactionId: transactionId ?? `TX-${Date.now().toString().slice(-6)}`,
        squarePaymentId: result.paymentId,
        squareOrderId: result.orderId,
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

  recordCancelled(booking: CheckoutBooking, result: OrderResult, mode: PaymentMode) {
    return this.record(
      {
        bookingId: booking.id,
        status: PaymentStatus.CANCELLED,
        mode,
        amount: result.amount,
        currency: result.currency,
        squareOrderId: result.orderId,
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
