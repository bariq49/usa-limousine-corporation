"use client";

import { BadgeCheck, BadgeX } from "lucide-react";
import { Calendar, DollarSign, Hash, Tag } from "../svg";
import { DetailItem } from "./detail-item";
import type { Payment } from "./types";

type Props = {
  payment?: Payment | null | undefined;
};

const STATUS_LABELS: Record<Payment["status"], string> = {
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export function BookingPaymentDetails({ payment }: Props) {
  if (!payment) return null;

  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(payment.amount),
  );

  return (
    <section className="flex flex-col rounded-md bg-default-100 p-4">
      <h3 className="font-bold text-default-900">Payment Details</h3>
      <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
        <DetailItem
          icon={
            payment.status === "PAID" ? (
              <BadgeCheck className="h-5 w-5 fill-default-900 text-white" />
            ) : (
              <BadgeX className="h-5 w-5 fill-destructive text-white" />
            )
          }
        >
          {STATUS_LABELS[payment.status]}
        </DetailItem>
        {payment.transactionId ? (
          <DetailItem icon={<Hash className="h-5 w-5" />}>{payment.transactionId}</DetailItem>
        ) : null}
        {payment.cardLast4 ? (
          <DetailItem icon={<Tag className="h-5 w-5" />}>
            {(payment.cardBrand ?? "Card").toUpperCase()} •••• {payment.cardLast4}
          </DetailItem>
        ) : null}
        <DetailItem icon={<DollarSign className="h-5 w-5" />}>{amount}</DetailItem>
        {payment.paidAt ? (
          <DetailItem icon={<Calendar className="h-5 w-5" />}>
            {new Date(payment.paidAt).toLocaleString("en-US")}
          </DetailItem>
        ) : null}
      </div>
    </section>
  );
}
