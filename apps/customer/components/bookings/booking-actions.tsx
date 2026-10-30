"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { ConfirmDialog } from "@usa-limousine-corporation/ui/components/confirm-dialog";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import {
  cancelBookingSchema,
  type CancelBookingSchema,
} from "@usa-limousine-corporation/ui/schemas";
import { Download } from "@usa-limousine-corporation/ui/svg";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import type { Item } from "@usa-limousine-corporation/ui/types/booking-model";
import { formatDateTime } from "@usa-limousine-corporation/ui/utils/date";
import {
  useCancelBooking,
  useCompleteBooking,
  useDownloadReceipt,
} from "@/hooks/queries/use-bookings";

export function BookingActions({ booking }: { booking: Item }) {
  const [dialog, setDialog] = useState<"cancel" | "complete" | null>(null);
  const cancelMutation = useCancelBooking();
  const completeMutation = useCompleteBooking();
  const downloadReceipt = useDownloadReceipt();
  const form = useForm<CancelBookingSchema>({
    resolver: zodResolver(cancelBookingSchema),
    defaultValues: { reason: "" },
  });

  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const canComplete =
    booking.status === "CONFIRMED" &&
    `${booking.bookingTime.pickupDate} ${booking.bookingTime.pickupTime}` <=
      formatDateTime({ date: new Date(), as: "value" });

  const orderId = booking.squareOrderId;
  const hasReceipt =
    Boolean(orderId) &&
    (booking.payment?.status === "PAID" || booking.payment?.status === "REFUNDED");
  const count = [canComplete, canCancel, hasReceipt].filter(Boolean).length;

  if (count === 0) {
    return null;
  }

  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
      {canComplete ? (
        <Button
          type="button"
          size="sm"
          className={cn("h-10 w-full px-3 sm:w-auto sm:px-4", count === 1 && "col-span-2")}
          onClick={() => setDialog("complete")}
        >
          Mark as completed
        </Button>
      ) : null}
      {canCancel ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className={cn("h-10 w-full px-3 sm:w-auto sm:px-4", count === 1 && "col-span-2")}
          onClick={() => {
            form.reset({ reason: "" });
            setDialog("cancel");
          }}
        >
          Cancel booking
        </Button>
      ) : null}
      {hasReceipt && orderId ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          isLoading={downloadReceipt.isPending}
          className={cn(
            "h-10 w-full gap-1.5 px-3 sm:w-auto sm:px-4",
            count % 2 === 1 && "col-span-2",
          )}
          onClick={() =>
            downloadReceipt.mutate({
              orderId,
              fileName: `receipt-${booking.bookingNumber}.pdf`,
            })
          }
        >
          {downloadReceipt.isPending ? null : <Download className="h-4 w-4" />}
          {downloadReceipt.isPending ? "Downloading..." : "Download receipt"}
        </Button>
      ) : null}
      <ConfirmDialog
        open={dialog === "cancel"}
        onOpenChange={(open) => {
          if (!open) {
            setDialog(null);
            form.reset({ reason: "" });
          }
        }}
        title="Cancel this booking?"
        description={`Booking ${booking.bookingNumber} will be cancelled. If you paid online, a refund is issued to your card according to our cancellation policy. This cannot be undone.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        confirmColor="destructive"
        pending={cancelMutation.isPending}
        onConfirm={() => {
          void form.handleSubmit((values) => {
            cancelMutation.mutate(
              { id: booking.id, reason: values.reason },
              {
                onSuccess: () => {
                  setDialog(null);
                  form.reset({ reason: "" });
                },
              },
            );
          })();
        }}
      >
        <Form {...form}>
          <Input
            name="reason"
            label="Cancellation reason"
            type="textarea"
            rows={3}
            placeholder="Tell us why you are cancelling"
          />
        </Form>
      </ConfirmDialog>
      <ConfirmDialog
        open={dialog === "complete"}
        onOpenChange={(open) => setDialog(open ? "complete" : null)}
        title="Mark this ride as completed?"
        description={`Booking ${booking.bookingNumber} will be marked as completed.`}
        confirmLabel="Mark as completed"
        cancelLabel="Not yet"
        pending={completeMutation.isPending}
        onConfirm={() => completeMutation.mutate(booking.id, { onSuccess: () => setDialog(null) })}
      />
    </div>
  );
}
