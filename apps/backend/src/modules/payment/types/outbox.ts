import type { Payment, PaymentOutboxEvent } from "@prisma/client";
import type { EventPayload } from "./events";
import type { UpdateInput } from "./payment";

export type CommitInput = {
  paymentId: string;
  data: UpdateInput;
  event: string;
  payload: EventPayload;
};

export type CommitResult = {
  payment: Payment;
  outbox: PaymentOutboxEvent;
};
