import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { QueryDto } from "../dto/payment.dto";
import { PaymentRepository } from "../repositories/payment.repository";

export type PaymentStatusView = {
  id: string;
  status: string;
  purpose: string;
  referenceId: string;
  paidAt: Date | null;
  failureCode: string | null;
};

@Injectable()
export class PaymentService {
  constructor(@Inject(PaymentRepository) private readonly paymentRepository: PaymentRepository) {}

  list(query: QueryDto) {
    return this.paymentRepository.findMany(query);
  }

  async getOne(id: string) {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }
    return payment;
  }

  async getStatus(id: string): Promise<PaymentStatusView> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    return {
      id: payment.id,
      status: payment.status,
      purpose: payment.purpose,
      referenceId: payment.referenceId,
      paidAt: payment.paidAt,
      failureCode: payment.failureCode,
    };
  }
}
