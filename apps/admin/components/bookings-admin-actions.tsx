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
import type { Item } from "@usa-limousine-corporation/ui/types/booking-model";
import {
  useCancelBooking,
  useCompleteBooking,
  useConfirmBooking,
} from "@/hooks/queries/use-bookings";

export function BookingAdminActions({ booking }: { booking: Item }) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const confirmMutation = useConfirmBooking();
  const cancelMutation = useCancelBooking();
  const completeMutation = useCompleteBooking();
  const form = useForm<CancelBookingSchema>({
    resolver: zodResolver(cancelBookingSchema),
    defaultValues: { reason: "" },
  });
  const isMutating =
    confirmMutation.isPending || cancelMutation.isPending || completeMutation.isPending;

  return (
    <>
      {booking.status === "PENDING" ? (
        <Button
          type="button"
          size="sm"
          className="h-10 px-3 sm:px-4"
          disabled={isMutating}
          isLoading={confirmMutation.isPending}
          onClick={() => confirmMutation.mutate(booking.id)}
        >
          Confirm
        </Button>
      ) : null}
      {booking.status === "CONFIRMED" ? (
        <Button
          type="button"
          size="sm"
          className="h-10 px-3 sm:px-4"
          disabled={isMutating}
          isLoading={completeMutation.isPending}
          onClick={() => completeMutation.mutate(booking.id)}
        >
          Complete
        </Button>
      ) : null}
      {booking.status === "PENDING" || booking.status === "CONFIRMED" ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-10 px-3 sm:px-4"
          disabled={isMutating}
          onClick={() => {
            form.reset({ reason: "" });
            setCancelOpen(true);
          }}
        >
          Cancel
        </Button>
      ) : null}
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          setCancelOpen(open);
          if (!open) form.reset({ reason: "" });
        }}
        title="Cancel this booking?"
        description={`Booking ${booking.bookingNumber} will be cancelled. This cannot be undone.`}
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
                  setCancelOpen(false);
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
    </>
  );
}
