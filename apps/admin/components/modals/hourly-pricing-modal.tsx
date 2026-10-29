"use client";

import { useEffect, useMemo } from "react";
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
import { Input, type InputOption } from "@usa-limousine-corporation/ui/components/input";
import { APP_CURRENCY, APP_DISTANCE_UNIT } from "@usa-limousine-corporation/ui/constants";
import {
  useCreateHourlyPricing,
  useUpdateHourlyPricing,
} from "@/hooks/queries/use-hourly-pricing";
import { useCategories } from "@/hooks/queries/use-vehicle-categories";
import { hourlyPricingSchema, type Schema as FormValues } from "@/lib/schemas/hourly-pricing";
import type { CreatePayload, Item } from "@/lib/types/hourly-pricing";

type HourlyPricingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Item | null;
  onSuccess?: () => void;
};

const statusOptions: InputOption[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export function HourlyPricingModal({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: HourlyPricingModalProps) {
  const isEditing = Boolean(initialData);
  const createMutation = useCreateHourlyPricing();
  const updateMutation = useUpdateHourlyPricing();

  const { data: categoriesData, isLoading: isLoadingCategories } = useCategories({
    limit: 100,
  });

  const categoryOptions: InputOption[] = useMemo(() => {
    return (categoriesData?.data ?? []).map((cat) => ({
      label: cat.name + (cat.passengerCount ? ` (${cat.passengerCount} seats)` : ""),
      value: cat.id,
    }));
  }, [categoriesData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(hourlyPricingSchema),
    mode: "all",
    defaultValues: {
      vehicleCategoryId: "",
      durationHours: 1,
      basePrice: 0,
      includedDistance: 0,
      extraDistanceRate: 0,
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        vehicleCategoryId: initialData.vehicleCategoryId,
        durationHours: Number(initialData.durationHours),
        basePrice: Number(initialData.basePrice),
        includedDistance: Number(initialData.includedDistance),
        extraDistanceRate: Number(initialData.extraDistanceRate),
        status: initialData.status,
      });
    } else {
      form.reset({
        vehicleCategoryId: categoryOptions[0]?.value ? String(categoryOptions[0].value) : "",
        durationHours: 1,
        basePrice: 0,
        includedDistance: 0,
        extraDistanceRate: 0,
        status: "ACTIVE",
      });
    }
  }, [initialData, form, open, categoryOptions]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: CreatePayload = {
        vehicleCategoryId: values.vehicleCategoryId,
        durationHours: values.durationHours,
        basePrice: values.basePrice,
        includedDistance: values.includedDistance,
        extraDistanceRate: values.extraDistanceRate,
        status: values.status,
      };

      if (isEditing && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      // Error is handled in hook toast
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-0 shadow-2xl p-6">
        <DialogHeader className="pb-1">
          <DialogTitle className="text-base font-semibold text-foreground">
            {isEditing ? "Edit hourly pricing" : "Add hourly pricing"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <Input
              name="vehicleCategoryId"
              label="Vehicle category"
              type="select"
              options={categoryOptions}
              placeholder={isLoadingCategories ? "Loading categories..." : "Select an option"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="durationHours"
                label="Duration (hours)"
                type="number"
                step="1"
                min="1"
              />
              <Input
                name="basePrice"
                label={`Hourly price (${APP_CURRENCY})`}
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="includedDistance"
                label={`Included distance (${APP_DISTANCE_UNIT})`}
                type="number"
                step="0.01"
                min="0"
              />
              <Input
                name="extraDistanceRate"
                label={`Extra per ${APP_DISTANCE_UNIT} (${APP_CURRENCY})`}
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <Input
              name="status"
              label="Status"
              type="select"
              options={statusOptions}
            />

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                isLoading={isPending}
              >
                {isEditing ? "Update hourly pricing" : "Add hourly pricing"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
