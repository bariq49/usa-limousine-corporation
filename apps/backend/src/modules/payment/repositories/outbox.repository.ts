import { Inject, Injectable } from "@nestjs/common";
import type { Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import type { CommitInput, CommitResult } from "../types/outbox";
import { buildPaymentUpdateData } from "../utils/payment-update";

@Injectable()
export class OutboxRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  commit(input: CommitInput): Promise<CommitResult> {
    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.update({
        where: { id: input.paymentId },
        data: buildPaymentUpdateData(input.data),
      });

      const outbox = await tx.paymentOutboxEvent.create({
        data: {
          event: input.event,
          payload: input.payload as Prisma.InputJsonValue,
        },
      });

      return { payment, outbox };
    });
  }

  findById(id: string) {
    return this.prisma.paymentOutboxEvent.findUnique({ where: { id } });
  }

  publish(id: string) {
    return this.prisma.paymentOutboxEvent.update({
      where: { id },
      data: { publishedAt: new Date() },
    });
  }

  findStale(olderThan: Date, take = 100) {
    return this.prisma.paymentOutboxEvent.findMany({
      where: {
        publishedAt: null,
        createdAt: { lte: olderThan },
      },
      orderBy: { createdAt: "asc" },
      take,
    });
  }

  deletePublishedBefore(before: Date) {
    return this.prisma.paymentOutboxEvent.deleteMany({
      where: {
        publishedAt: { not: null, lte: before },
      },
    });
  }
}
