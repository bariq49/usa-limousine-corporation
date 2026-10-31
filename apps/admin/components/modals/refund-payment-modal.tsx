"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@usa-limousine-corporation/ui/components/dialog";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { useRefundPayment } from "@/hooks/queries/use-payments";
import { refundPaymentSchema, type RefundPaymentSchema } from "@/lib/schemas/refunds";
import type { Payment } from "@/lib/types/payments";

type RefundPaymentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  onSuccess?: () => void;
};

export function RefundPaymentModal({
  open,
  onOpenChange,
  payment,
  onSuccess,
}: RefundPaymentModalProps) {
  const refundMutation = useRefundPayment();

  const maxRefundable = payment
    ? Math.max(0, payment.amount - (payment.refundedAmount || 0))
    : 0;

  const form = useForm<RefundPaymentSchema>({
    resolver: zodResolver(refundPaymentSchema),
    mode: "all",
    defaultValues: {
      amount: maxRefundable,
      manual: false,
      reason: "",
    },
  });

  useEffect(() => {
    if (!open || !payment) return;
    const remaining = Math.max(0, payment.amount - (payment.refundedAmount || 0));
    form.reset({
      amount: remaining,
      manual: !payment.squarePaymentId,
      reason: "",
    });
  }, [open, payment, form]);

  if (!payment) return null;

  const onSubmit = async (values: RefundPaymentSchema) => {
    try {
      await refundMutation.mutateAsync({
        id: payment.id,
        input: {
          amount: Number(values.amount),
          manual: values.manual,
          reason: values.reason?.trim() || undefined,
        },
      });
      onOpenChange(false);
      onSuccess?.();
    } catch {
      return;
    }
  };

  const isPending = refundMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Issue Refund</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-xs text-default-600">
              <div className="flex justify-between">
                <span>Transaction:</span>
                <span className="font-mono font-semibold text-default-900">
                  {payment.transactionId || payment.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Booking:</span>
                <span className="font-semibold text-default-900">
                  {payment.booking?.bookingNumber || payment.bookingId}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold text-default-900">{payment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Original Amount:</span>
                <span className="font-semibold text-default-900">${payment.amount.toFixed(2)}</span>
              </div>
              {payment.refundedAmount && payment.refundedAmount > 0 ? (
                <div className="flex justify-between">
                  <span>Already Refunded:</span>
                  <span className="font-semibold text-warning">
                    ${payment.refundedAmount.toFixed(2)}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between pt-1 border-t border-border/50">
                <span className="font-medium text-default-800">Available to Refund:</span>
                <span className="font-mono font-bold text-success">${maxRefundable.toFixed(2)}</span>
              </div>
            </div>

            <Input
              name="amount"
              type="number"
              label="Refund Amount ($)"
              placeholder={maxRefundable.toFixed(2)}
            />

            {payment.squarePaymentId ? (
              <Input
                name="manual"
                type="checkbox"
                label="Record as manual / offline refund (skip Square gateway)"
              />
            ) : null}

            <Input
              name="reason"
              label="Reason / Notes (Optional)"
              placeholder="e.g. Customer cancelled ride, partial fee adjustment..."
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="default"
                size="sm"
                disabled={isPending}
                isLoading={isPending}
              >
                {isPending
                  ? "Processing..."
                  : form.watch("manual")
                    ? "Record Manual Refund"
                    : "Refund via Square"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
