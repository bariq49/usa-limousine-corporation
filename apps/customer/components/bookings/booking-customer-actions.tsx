"use client";

import { useState } from "react";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { ConfirmDialog } from "@usa-limousine-corporation/ui/components/confirm-dialog";
import type { Item } from "@usa-limousine-corporation/ui/bookings/types";
import { useCancelBooking } from "@/hooks/queries/use-bookings";

/** Customers can cancel their own booking while it is pending or confirmed. */
export function BookingCustomerActions({ booking }: { booking: Item }) {
  const [open, setOpen] = useState(false);
  const cancelMutation = useCancelBooking();

  if (booking.status !== "PENDING" && booking.status !== "CONFIRMED") {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-10 px-3 sm:px-4"
        onClick={() => setOpen(true)}
      >
        Cancel booking
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Cancel this booking?"
        description={`Booking ${booking.bookingNumber} will be cancelled. This cannot be undone.`}
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        confirmColor="destructive"
        pending={cancelMutation.isPending}
        onConfirm={() =>
          cancelMutation.mutate(
            { id: booking.id, reason: "Cancelled by customer" },
            { onSuccess: () => setOpen(false) },
          )
        }
      />
    </>
  );
}
