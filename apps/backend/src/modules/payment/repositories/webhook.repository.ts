import { Inject, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../infrastructure/database/prisma.service";
import { PaymentRepository } from "./payment.repository";

@Injectable()
export class WebhookRepository {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PaymentRepository) private readonly paymentRepository: PaymentRepository,
  ) {}

  findById(id: string) {
    return this.paymentRepository.findById(id);
  }

  findByCheckoutSessionId(sessionId: string) {
    return this.paymentRepository.findByCheckoutSessionId(sessionId);
  }

  update(...args: Parameters<PaymentRepository["update"]>) {
    return this.paymentRepository.update(...args);
  }

  async tryRecordEvent(id: string, type: string): Promise<boolean> {
    try {
      await this.prisma.paymentWebhookEvent.create({ data: { id, type } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return false;
      }
      throw error;
    }
  }

  async deleteEvent(id: string): Promise<void> {
    await this.prisma.paymentWebhookEvent.delete({ where: { id } }).catch(() => undefined);
  }
}
