"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueries } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "../card";
import { ConfirmDialog } from "../confirm-dialog";
import { DataTable } from "../data-table/data-table";
import { Form } from "../form";
import { Input } from "../input";
import { Skeleton } from "../skeleton";
import {
  cancelBookingSchema,
  type CancelBookingSchema,
} from "../../schemas/booking/cancel.schema";
import { formatDate } from "../../utils/date";
import type { Item } from "../../types/booking-model";
import type { DayRideCardsProps } from "../../types/bookings";
import { BookingCard } from "./booking-card";
import { filter, getColumns } from "./booking-columns";

export function DayRideCards(props: DayRideCardsProps) {
  const {
    day,
    basePath,
    getBooking,
    bookingQueryKey,
    onCancelBooking,
    cancelPending = false,
    onEditBooking,
  } = props;
  const { date, rides } = day;
  const [cancelling, setCancelling] = useState<Item | null>(null);
  const form = useForm<CancelBookingSchema>({
    resolver: zodResolver(cancelBookingSchema),
    defaultValues: { reason: "" },
  });
  const columns = useMemo(() => getColumns({ basePath }), [basePath]);
  const results = useQueries({
    queries: rides.map((ride) => ({
      queryKey: bookingQueryKey
        ? bookingQueryKey(ride.id)
        : (["bookings", "detail", ride.id] as const),
      queryFn: () => getBooking(ride.id),
    })),
  });

  const bookings = results
    .map((result) => result.data)
    .filter((booking): booking is Item => Boolean(booking));
  const isLoading = results.some((result) => result.isLoading) && bookings.length === 0;
  const dayLabel = formatDate({
    date,
    options: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  });
  const rideLabel =
    rides.length === 0
      ? "No rides scheduled for this day."
      : `${rides.length} ${rides.length === 1 ? "ride" : "rides"} scheduled for this day.`;

  return (
    <>
      <div className="grid gap-4 md:hidden">
        {rides.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card px-3 py-6 text-center text-sm text-default-500">
            No rides on this day.
          </p>
        ) : (
          results.map((result, index) => {
            const booking = result.data;
            if (!booking) {
              return (
                <Skeleton key={rides[index]?.id ?? index} className="h-96 w-full rounded-xl" />
              );
            }
            const isOpen = booking.status === "PENDING" || booking.status === "CONFIRMED";
            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                detailsHref={`${basePath}/${booking.id}`}
                onCancel={
                  isOpen && onCancelBooking
                    ? () => {
                        form.reset({ reason: "" });
                        setCancelling(booking);
                      }
                    : undefined
                }
                onEdit={isOpen && onEditBooking ? () => onEditBooking(booking) : undefined}
              />
            );
          })
        )}
      </div>

      <Card className="hidden border border-border bg-card shadow-xs md:block">
        <CardContent className="p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-default-900">Rides for this day</h2>
            <p className="mt-1 text-xs text-default-500">
              {dayLabel} · {rideLabel}
            </p>
          </div>

          <DataTable
            columns={columns}
            data={bookings}
            searchKey="bookingNumber"
            searchPlaceholder="Search by booking number..."
            filterColumns={filter}
            loading={isLoading}
            fetching={results.some((result) => result.isFetching)}
          />
        </CardContent>
      </Card>

      {onCancelBooking ? (
        <ConfirmDialog
          open={Boolean(cancelling)}
          onOpenChange={(open) => {
            if (!open) {
              setCancelling(null);
              form.reset({ reason: "" });
            }
          }}
          title="Cancel this booking?"
          description={`Booking ${cancelling?.bookingNumber ?? ""} will be cancelled. This cannot be undone.`}
          confirmLabel="Cancel booking"
          cancelLabel="Keep booking"
          confirmColor="destructive"
          pending={cancelPending}
          onConfirm={() => {
            void form.handleSubmit((values) => {
              if (!cancelling) return;
              void Promise.resolve(
                onCancelBooking({ id: cancelling.id, reason: values.reason }),
              ).then(() => {
                setCancelling(null);
                form.reset({ reason: "" });
              });
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
      ) : null}
    </>
  );
}
