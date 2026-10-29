"use client";

import { Button } from "@usa-limousine-corporation/ui/components/button";
import type { Item } from "@usa-limousine-corporation/ui/types/booking-model";
import {
  useCancelBooking,
  useCompleteBooking,
  useConfirmBooking,
} from "@/hooks/queries/use-bookings";

/** Confirm / Complete / Cancel buttons for the shared booking detail view. */
export function BookingAdminActions({ booking }: { booking: Item }) {
  const confirmMutation = useConfirmBooking();
  const cancelMutation = useCancelBooking();
  const completeMutation = useCompleteBooking();
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
          isLoading={cancelMutation.isPending}
          onClick={() => cancelMutation.mutate({ id: booking.id })}
        >
          Cancel
        </Button>
      ) : null}
    </>
  );
}
