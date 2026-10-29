"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@usa-limousine-corporation/ui/components/dialog";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input, type InputOption } from "@usa-limousine-corporation/ui/components/input";
import type { Item } from "@usa-limousine-corporation/ui/types/booking-model";
import { formatPrice } from "@usa-limousine-corporation/ui/utils/price";
import { driverName } from "@/components/columns/driver-columns";
import { useAssignDriver, useDrivers } from "@/hooks/queries/use-drivers";
import { assignSchema, type AssignSchema } from "@/lib/schemas/drivers";
import type { Assignment } from "@/lib/types/drivers";

type AssignDriverModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: Item;
  current?: Assignment | undefined;
};

export function AssignDriverModal({
  open,
  onOpenChange,
  booking,
  current,
}: AssignDriverModalProps) {
  const assignMutation = useAssignDriver();
  const { data: driversData, isLoading } = useDrivers({ status: "ACTIVE", limit: 100 }, open);
  const total = Number(booking.totalPrice ?? 0);

  const driverOptions: InputOption[] = useMemo(() => {
    const drivers = driversData?.data ?? [];
    const matching = drivers.filter(
      (driver) => driver.vehicleCategoryId === booking.vehicleCategoryId,
    );
    const others = drivers.filter(
      (driver) => driver.vehicleCategoryId !== booking.vehicleCategoryId,
    );
    return matching.concat(others).map((driver) => ({
      label: `${driverName(driver)} · ${driver.vehicleCategory.name}`,
      value: driver.id,
    }));
  }, [driversData, booking.vehicleCategoryId]);

  const form = useForm<AssignSchema>({
    resolver: zodResolver(assignSchema),
    mode: "all",
    defaultValues: { driverId: "", commissionRate: 20, note: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      driverId: current?.driverId ?? "",
      commissionRate: current ? Number(current.commissionRate) : 20,
      note: current?.note ?? "",
    });
  }, [current, form, open]);

  const rate = Number(useWatch({ control: form.control, name: "commissionRate" })) || 0;
  const commission = Math.round(total * Math.min(Math.max(rate, 0), 100)) / 100;

  const onSubmit = async (values: AssignSchema) => {
    try {
      await assignMutation.mutateAsync({
        bookingId: booking.id,
        payload: {
          driverId: values.driverId,
          commissionRate: values.commissionRate,
          note: values.note || undefined,
        },
      });
      onOpenChange(false);
    } catch {
      return;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{current ? "Reassign Driver" : "Assign Driver"}</DialogTitle>
          <DialogDescription>
            Booking {booking.bookingNumber} · Total {formatPrice({ price: total })}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <Input
              name="driverId"
              label={isLoading ? "Loading drivers..." : "Driver"}
              type="select"
              options={driverOptions}
            />
            <Input
              name="commissionRate"
              label="Admin Commission (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
            />
            <Input name="note" label="Note for the driver (Optional)" type="textarea" />

            <div className="space-y-2 rounded-md bg-default-100 p-4 text-sm">
              <div className="flex items-center justify-between text-default-600">
                <span>Booking total</span>
                <span>{formatPrice({ price: total })}</span>
              </div>
              <div className="flex items-center justify-between text-default-600">
                <span>Admin commission</span>
                <span>{formatPrice({ price: commission })}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2 font-semibold text-default-900">
                <span>Driver payout</span>
                <span>{formatPrice({ price: Math.round((total - commission) * 100) / 100 })}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={assignMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={assignMutation.isPending}
                isLoading={assignMutation.isPending}
              >
                {current ? "Reassign" : "Assign"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
