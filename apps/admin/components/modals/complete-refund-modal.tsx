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
import { useCompleteRefund, useRejectRefund } from "@/hooks/queries/use-refunds";
import { completeRefundSchema, rejectRefundSchema } from "@/lib/schemas/refunds";
import type { Refund } from "@/lib/types/payments";

type FormValues = {
  manual: boolean;
  reason?: string | undefined;
};

type CompleteRefundModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refund: Refund | null;
  mode?: "complete" | "reject";
  onSuccess?: () => void;
};

export function CompleteRefundModal({
  open,
  onOpenChange,
  refund,
  mode = "complete",
  onSuccess,
}: CompleteRefundModalProps) {
  const isReject = mode === "reject";
  const completeMutation = useCompleteRefund();
  const rejectMutation = useRejectRefund();

  const form = useForm<FormValues>({
    resolver: zodResolver(isReject ? rejectRefundSchema : completeRefundSchema),
    mode: "all",
    defaultValues: {
      manual: false,
      reason: "",
    },
  });

  useEffect(() => {
    if (!open || !refund) return;
    form.reset({
      manual: !refund.payment?.squarePaymentId,
      reason: refund.reason || "",
    });
  }, [open, refund, form]);

  if (!refund) return null;

  const onSubmit = async (values: FormValues) => {
    try {
      if (isReject) {
        await rejectMutation.mutateAsync({
          id: refund.id,
          input: { reason: values.reason?.trim() || undefined },
        });
      } else {
        await completeMutation.mutateAsync({
          id: refund.id,
          input: {
            manual: values.manual,
            reason: values.reason?.trim() || undefined,
          },
        });
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      return;
    }
  };

  const isPending = completeMutation.isPending || rejectMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{isReject ? "Reject Refund" : "Process Refund"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1 rounded-lg border border-border bg-muted/40 p-3 text-xs text-default-600">
              <div className="flex justify-between">
                <span>Booking Number:</span>
                <span className="font-semibold text-default-900">
                  {refund.booking?.bookingNumber || refund.bookingId}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span className="font-semibold text-default-900">
                  {refund.payment?.customerName || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Refund Amount:</span>
                <span className="font-semibold text-warning">${refund.amount.toFixed(2)}</span>
              </div>
            </div>

            {!isReject && refund.payment?.squarePaymentId ? (
              <Input
                name="manual"
                type="checkbox"
                label="Record as manual / offline refund (skip Square gateway)"
              />
            ) : null}

            <Input
              name="reason"
              label={isReject ? "Rejection Reason" : "Notes / Reason (Optional)"}
              placeholder={
                isReject ? "Reason for rejecting this refund..." : "Optional refund note..."
              }
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
                color={isReject ? "destructive" : "default"}
                size="sm"
                disabled={isPending}
                isLoading={isPending}
              >
                {isPending
                  ? "Processing..."
                  : isReject
                    ? "Reject Refund"
                    : form.watch("manual")
                      ? "Mark as Refunded"
                      : "Complete via Square"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
