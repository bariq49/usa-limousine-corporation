"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@usa-limousine-corporation/ui/components/avatar";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { ConfirmDialog } from "@usa-limousine-corporation/ui/components/confirm-dialog";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import type { Item } from "@usa-limousine-corporation/ui/bookings/types";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { driverName } from "@/components/columns/driver-columns";
import { AssignDriverModal } from "@/components/modals/assign-driver-modal";
import { useAssignments, useUnassignDriver } from "@/hooks/queries/use-drivers";

export function BookingDriverCard({ booking }: { booking: Item }) {
  const { data: assignments, isLoading } = useAssignments(booking.id);
  const unassignMutation = useUnassignDriver();
  const [assignOpen, setAssignOpen] = useState(false);
  const [unassignOpen, setUnassignOpen] = useState(false);
  const current = assignments?.find((item) => item.status === "ACTIVE");
  const canAssign = booking.status !== "COMPLETED" && booking.status !== "CANCELLED";

  if (!current && !canAssign) return null;

  return (
    <section className="rounded-md bg-default-100 p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-default-900">Assigned Driver</h3>
        {canAssign ? (
          <div className="flex items-center gap-2">
            {current ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-3"
                onClick={() => setUnassignOpen(true)}
              >
                Unassign
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              className="h-8 px-3"
              onClick={() => setAssignOpen(true)}
            >
              {current ? "Reassign" : "Assign Driver"}
            </Button>
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <Skeleton className="mt-3 h-14 w-full" />
      ) : current ? (
        <div className="mt-3 space-y-3">
          <Link href={`/drivers/${current.driver.id}`} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {current.driver.user.avatar ? (
                <AvatarImage src={current.driver.user.avatar} alt={driverName(current.driver)} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {(driverName(current.driver)[0] ?? "?").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-default-900 hover:text-primary">
                {driverName(current.driver)}
              </p>
              <p className="truncate text-xs text-default-500">
                {current.driver.user.phone || current.driver.user.email} ·{" "}
                {current.driver.vehicleCategory.name}
              </p>
            </div>
          </Link>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between text-default-600">
              <span>Admin commission ({Number(current.commissionRate)}%)</span>
              <span>{formatPrice({ price: Number(current.commissionAmount) })}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-default-900">
              <span>Driver payout</span>
              <span>{formatPrice({ price: Number(current.driverAmount) })}</span>
            </div>
          </div>
          {current.note ? (
            <p className="whitespace-pre-wrap text-sm text-default-700">{current.note}</p>
          ) : null}
        </div>
      ) : (
        <p className="mt-2 text-sm text-default-500">
          No driver has been assigned to this ride yet.
        </p>
      )}

      <AssignDriverModal
        open={assignOpen}
        onOpenChange={setAssignOpen}
        booking={booking}
        current={current}
      />
      <ConfirmDialog
        open={unassignOpen}
        onOpenChange={setUnassignOpen}
        title="Unassign driver?"
        description="The ride goes back to unassigned. You can assign another driver at any time."
        confirmLabel="Unassign"
        confirmColor="destructive"
        pending={unassignMutation.isPending}
        onConfirm={async () => {
          try {
            await unassignMutation.mutateAsync(booking.id);
            setUnassignOpen(false);
          } catch {
            return;
          }
        }}
      />
    </section>
  );
}
