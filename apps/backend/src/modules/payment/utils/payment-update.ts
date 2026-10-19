import { Prisma, type Prisma as PrismaTypes } from "@prisma/client";
import type { UpdateInput } from "../types/payment";

export function buildPaymentUpdateData(data: UpdateInput): PrismaTypes.PaymentUpdateInput {
  const updateData: Prisma.PaymentUpdateInput = {};

  if (data.amount !== undefined) {
    updateData.amount = data.amount;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.method !== undefined) {
    updateData.method =
      data.method === null ? Prisma.DbNull : (data.method as Prisma.InputJsonValue);
  }
  if (data.checkout !== undefined) {
    updateData.checkout =
      data.checkout === null ? Prisma.DbNull : (data.checkout as Prisma.InputJsonValue);
  }
  if (data.failureCode !== undefined) {
    updateData.failureCode = data.failureCode;
  }
  if (data.failureMessage !== undefined) {
    updateData.failureMessage = data.failureMessage;
  }
  if (data.paidAt !== undefined) {
    updateData.paidAt = data.paidAt;
  }
  if (data.cancelledAt !== undefined) {
    updateData.cancelledAt = data.cancelledAt;
  }
  if (data.refundedAt !== undefined) {
    updateData.refundedAt = data.refundedAt;
  }
  if (data.refundedAmount !== undefined) {
    updateData.refundedAmount = data.refundedAmount;
  }

  return updateData;
}
