"use client";

import { useState } from "react";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { ConfirmDialog } from "@usa-limousine-corporation/ui/components/confirm-dialog";
import type { Item } from "@usa-limousine-corporation/ui/bookings/types";
import { formatDateTime } from "@usa-limousine-corporation/ui/utils/date";
import { useCancelBooking, useCompleteBooking } from "@/hooks/queries/use-bookings";

/** Customers can cancel a pending or confirmed booking, and complete a confirmed ride after pickup. */
export function BookingCustomerActions({ booking }: { booking: Item }) {
  const [dialog, setDialog] = useState<"cancel" | "complete" | null>(null);
  const cancelMutation = useCancelBooking();
  const completeMutation = useCompleteBooking();

  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";
  const canComplete =
    booking.status === "CONFIRMED" &&
    `${booking.bookingTime.pickupDate} ${booking.bookingTime.pickupTime}` <=
      formatDateTime({ date: new Date(), as: "value" });

  if (!canCancel && !canComplete) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {canComplete ? (
        <Button
          type="button"
          size="sm"
          className="h-10 px-3 sm:px-4"
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
          className="h-10 px-3 sm:px-4"
          onClick={() => setDialog("cancel")}
        >
          Cancel booking
        </Button>
      ) : null}
      <ConfirmDialog
        open={dialog === "cancel"}
        onOpenChange={(open) => setDialog(open ? "cancel" : null)}
        title="Cancel this booking?"
        description={`Booking ${booking.bookingNumber} will be cancelled. If you paid online, a refund is issued to your card according to our cancellation policy. This cannot be undone.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        confirmColor="destructive"
        pending={cancelMutation.isPending}
        onConfirm={() =>
          cancelMutation.mutate(
            { id: booking.id, reason: "Cancelled by customer" },
            { onSuccess: () => setDialog(null) },
          )
        }
      />
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
