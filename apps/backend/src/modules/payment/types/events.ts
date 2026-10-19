import type { PaymentPurpose, PaymentStatus } from "@prisma/client";

export type EventPayload = {
  id: string;
  purpose: PaymentPurpose;
  referenceId: string;
  status: PaymentStatus;
};
