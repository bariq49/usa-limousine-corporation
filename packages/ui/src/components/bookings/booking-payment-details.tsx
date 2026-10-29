"use client";

import { BadgeCheck, BadgeX } from "lucide-react";
import { Calendar, DollarSign, Hash, Tag } from "../../svg";
import { formatDateTime } from "../../utils/date";
import { DetailItem } from "./detail-item";
import type { Payment } from "../../types/booking-model";
import type { BookingPaymentDetailsProps } from "../../types/bookings";


const STATUS_LABELS: Record<Payment["status"], string> = {
  PAID: "Paid",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

export function BookingPaymentDetails(props: BookingPaymentDetailsProps) {
  const { payment } = props;
  if (!payment) return null;

  const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

  return (
    <section className="flex flex-col rounded-md bg-default-100 p-4">
      <h3 className="font-bold text-default-900">Payment Details</h3>
      <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
        <DetailItem
          icon={
            payment.status !== "CANCELLED" ? (
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
        <DetailItem icon={<DollarSign className="h-5 w-5" />}>
          {currency.format(Number(payment.amount))}
        </DetailItem>
        {payment.paidAt ? (
          <DetailItem icon={<Calendar className="h-5 w-5" />}>
            {formatDateTime({ date: payment.paidAt })}
          </DetailItem>
        ) : null}
        {payment.refundedAmount ? (
          <DetailItem icon={<DollarSign className="h-5 w-5" />}>
            Refunded {currency.format(Number(payment.refundedAmount))}
            {payment.refundedAt ? ` on ${formatDateTime({ date: payment.refundedAt })}` : ""}
          </DetailItem>
        ) : null}
      </div>
    </section>
  );
}
