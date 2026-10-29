"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import {
  useCreateVehiclePricing,
  useUpdateVehiclePricing,
} from "@/hooks/queries/use-vehicle-pricing";
import { useCategories } from "@/hooks/queries/use-vehicle-categories";
import { vehiclePricingSchema, type Schema as FormValues } from "@/lib/schemas/vehicle-pricing";
import type { CreatePayload, Item, Type } from "@/lib/types/vehicle-pricing";

type PricingModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Item | null;
  onSuccess?: () => void;
};

const pricingTypeOptions: InputOption[] = [
  { label: "Fixed", value: "FIXED" },
  { label: `Per ${APP_DISTANCE_UNIT}`, value: "PER_UNIT" },
];

const statusOptions: InputOption[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export function PricingModal({ open, onOpenChange, initialData, onSuccess }: PricingModalProps) {
  const isEditing = Boolean(initialData);
  const createMutation = useCreateVehiclePricing();
  const updateMutation = useUpdateVehiclePricing();

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
    resolver: zodResolver(vehiclePricingSchema),
    mode: "all",
    defaultValues: {
      vehicleCategoryId: "",
      minimumDistance: 0,
      maximumDistance: null,
      pricingType: "FIXED",
      basePrice: 0,
      perUnitRate: null,
      percentageRate: 0,
      status: "ACTIVE",
    },
  });

  const pricingType = useWatch({
    control: form.control,
    name: "pricingType",
  }) as Type;

  useEffect(() => {
    if (initialData) {
      form.reset({
        vehicleCategoryId: initialData.vehicleCategoryId,
        minimumDistance: Number(initialData.minimumDistance),
        maximumDistance:
          initialData.maximumDistance != null ? Number(initialData.maximumDistance) : null,
        pricingType: initialData.pricingType,
        basePrice: Number(initialData.basePrice),
        perUnitRate: initialData.perUnitRate != null ? Number(initialData.perUnitRate) : null,
        percentageRate: initialData.percentageRate != null ? Number(initialData.percentageRate) : 0,
        status: initialData.status,
      });
    } else {
      form.reset({
        vehicleCategoryId: categoryOptions[0]?.value ? String(categoryOptions[0].value) : "",
        minimumDistance: 0,
        maximumDistance: null,
        pricingType: "FIXED",
        basePrice: 0,
        perUnitRate: null,
        percentageRate: 0,
        status: "ACTIVE",
      });
    }
  }, [initialData, form, open, categoryOptions]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: CreatePayload = {
        vehicleCategoryId: values.vehicleCategoryId,
        minimumDistance: values.minimumDistance,
        maximumDistance: values.maximumDistance ?? null,
        pricingType: values.pricingType,
        basePrice: values.basePrice,
        perUnitRate: values.pricingType === "PER_UNIT" ? (values.perUnitRate ?? null) : null,
        percentageRate: values.percentageRate ?? null,
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
            {isEditing ? "Edit pricing slab" : "Add pricing slab"}
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
                name="minimumDistance"
                label={`Min distance (${APP_DISTANCE_UNIT})`}
                type="number"
                step="0.01"
                min="0"
              />
              <Input
                name="maximumDistance"
                label={`Max distance (${APP_DISTANCE_UNIT})`}
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div
              className={cn(
                "grid grid-cols-1 gap-4",
                pricingType === "PER_UNIT" ? "md:grid-cols-3" : "md:grid-cols-2",
              )}
            >
              <Input
                name="pricingType"
                label="Pricing type"
                type="select"
                options={pricingTypeOptions}
              />
              <Input
                name="basePrice"
                label={`Base / Flat price (${APP_CURRENCY})`}
                type="number"
                step="0.01"
                min="0"
              />
              {pricingType === "PER_UNIT" ? (
                <Input
                  name="perUnitRate"
                  label={`Per ${APP_DISTANCE_UNIT} (${APP_CURRENCY})`}
                  type="number"
                  step="0.01"
                  min="0"
                />
              ) : null}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingType === "PERCENTAGE" ? (
                <Input name="percentageRate" label="Increase %" type="number" step="0.1" min="0" />
              ) : null}
              <Input name="status" label="Status" type="select" options={statusOptions} />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} isLoading={isPending}>
                {isEditing ? "Update pricing slab" : "Add pricing slab"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
