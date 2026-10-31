
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

import {
  useCancelBooking,
  useCompleteBooking,
  useDownloadReceipt,
} from "@/hooks/queries/use-bookings";

type BookingActionsProps = {
  booking: Item;
};

type DialogType = "cancel" | "complete" | null;

export function BookingActions({ booking }: BookingActionsProps) {
  const [dialog, setDialog] = useState<DialogType>(null);

  const cancelMutation = useCancelBooking();
  const completeMutation = useCompleteBooking();
  const downloadReceipt = useDownloadReceipt();

  const form = useForm<CancelBookingSchema>({
    resolver: zodResolver(cancelBookingSchema),
    defaultValues: {
      reason: "",
    },
  });

  const canCancel = ["PENDING", "CONFIRMED"].includes(booking.status);

  const canComplete = booking.status === "CONFIRMED"

  const orderId = booking.squareOrderId;

  const hasReceipt = Boolean(orderId) && ["PAID", "REFUNDED"].includes(booking.payment?.status ?? "");

  const actionCount = [canComplete, canCancel, hasReceipt].filter(Boolean).length;
  const closeCancelDialog = () => {
    setDialog(null);
    form.reset({ reason: "" });
  };

  const openCancelDialog = () => {
    form.reset({ reason: "" });
    setDialog("cancel");
  };

  const handleCancelBooking = form.handleSubmit((values) => {
    cancelMutation.mutate(
      {
        id: booking.id,
        reason: values.reason,
      },
      {
        onSuccess: closeCancelDialog,
      },
    );
  });

  const handleCompleteBooking = () => {
    completeMutation.mutate(booking.id, {
      onSuccess: () => setDialog(null),
    });
  };

  const handleDownloadReceipt = () => {
    if (!orderId) return;

    downloadReceipt.mutate({
      orderId,
      fileName: `receipt-${booking.bookingNumber}.pdf`,
    });
  };

  if (actionCount === 0) return null;

  return (
    <>
      <div className="grid w-full grid-cols-2 gap-2 sm:hidden">
        {canComplete && (
          <Button
            type="button"
            size="sm"
            className={cn(
              "h-10 w-full px-3 sm:w-auto sm:px-4",
              actionCount === 1 && "col-span-2",
            )}
            onClick={() => setDialog("complete")}
          >
            Mark as completed
          </Button>
        )}

        {canCancel && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className={cn(
              "h-10 w-full px-3 sm:w-auto sm:px-4",
              actionCount === 1 && "col-span-2",
            )}
            onClick={openCancelDialog}
          >
            Cancel booking
          </Button>
        )}

        {hasReceipt && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            isLoading={downloadReceipt.isPending}
            className={cn(
              "h-10 w-full gap-1.5 px-3 sm:w-auto sm:px-4",
              actionCount % 2 === 1 && "col-span-2",
            )}
            onClick={handleDownloadReceipt}
          >
            {!downloadReceipt.isPending && (
              <Download className="h-4 w-4" />
            )}

            {downloadReceipt.isPending
              ? "Downloading..."
              : "Download receipt"}
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={dialog === "cancel"}
        onOpenChange={(open) => {
          if (!open) closeCancelDialog();
        }}
        title="Cancel this booking?"
        description={`Booking ${booking.bookingNumber} will be cancelled. If you paid online, a refund is issued to your card according to our cancellation policy. This cannot be undone.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        confirmColor="destructive"
        pending={cancelMutation.isPending}
        onConfirm={handleCancelBooking}
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
        onConfirm={handleCompleteBooking}
      />
    </>
  );
}
