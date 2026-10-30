"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { useLuggage } from "@/hooks/queries/use-luggage";
import { useUploadFile } from "@/hooks/queries/use-upload";
import { StandardLuggageCard } from "@/components/luggage-capacity-cards";
import { vehicleCategorySchema, type Schema as FormValues } from "@/lib/schemas/vehicle-category";

type Props = {
  title?: string;
  subtitle?: string;
  submitLabel: string;
  pending?: boolean;
  showStatus?: boolean;
  initialValues?: Partial<FormValues>;
  existingCapacities?: Array<{ luggageTypeId: string; quantity: number }>;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
};

export function VehicleCategoryForm(props: Props) {
  const {
    title,
    subtitle,
    submitLabel,
    pending = false,
    showStatus = false,
    initialValues,
    existingCapacities,
    onSubmit,
    onCancel,
  } = props;

  const upload = useUploadFile();
  const { data: standardData, isLoading: loadingStandard } = useLuggage({
    isActive: true,
    limit: 100,
  });

  const standardLuggage = standardData?.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(vehicleCategorySchema),
    mode: "all",
    defaultValues: {
      name: initialValues?.name ?? "",
      models: initialValues?.models ?? "",
      description: initialValues?.description ?? "",
      image: initialValues?.image ?? "",
      passengerCount: initialValues?.passengerCount ?? 4,
      sortOrder: initialValues?.sortOrder ?? 0,
      isActive: initialValues?.isActive ?? true,
      standardLuggageCapacity: [],
    },
  });

  const standardCapacities = useWatch({
    control: form.control,
    name: "standardLuggageCapacity",
  });
  const ready = !loadingStandard && (standardCapacities?.length ?? 0) === standardLuggage.length;

  useEffect(() => {
    if (loadingStandard) return;

    const qtyById = new Map(
      (existingCapacities ?? []).map((item) => [item.luggageTypeId, item.quantity]),
    );
    const standard = standardData?.data ?? [];

    form.setValue(
      "standardLuggageCapacity",
      standard.map((item) => ({
        luggageTypeId: item.id,
        quantity: qtyById.get(item.id) ?? 0,
      })),
      { shouldValidate: false },
    );
  }, [existingCapacities, form, loadingStandard, standardData?.data]);

  const isPending = pending || upload.isPending;
  const standardError =
    form.formState.errors.standardLuggageCapacity?.message ||
    form.formState.errors.standardLuggageCapacity?.root?.message;

  return (
    <>
      {title || subtitle ? (
        <div className="mb-5">
          {title ? <h2 className="text-lg font-bold text-default-900">{title}</h2> : null}
          {subtitle ? (
            <p className={`text-xs text-default-500 ${title ? "mt-1" : ""}`}>{subtitle}</p>
          ) : null}
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2 lg:items-stretch">
            <div className="space-y-4">
              <Input name="name" label="Category Name" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  name="passengerCount"
                  label="Passenger Count"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                />
                <Input
                  name="sortOrder"
                  label="Display Order"
                  type="number"
                  min="0"
                  step="1"
                />
              </div>
              <Input
                name="models"
                label="Vehicle Models"
                placeholder="e.g. Skoda Octavia, Toyota Prius or similar"
              />
              <Input name="description" label="Description" type="textarea" rows={5} />
            </div>

            <Input
              name="image"
              label="Category Image"
              type="upload"
              accept="image/*"
              onUpload={async (file) => {
                const result = await upload.mutateAsync({
                  file,
                  folder: "vehicle-categories",
                });
                return result.secureUrl || result.url;
              }}
              className="h-full -mt-1.5 flex flex-col [&>div]:flex-1 [&>div]:flex [&>div]:min-h-0 [&>div]:flex-col"
              inputClassName="flex-1"
            />
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-default-900">Luggage Capacity</h3>
              <p className="text-xs text-default-500 mt-0.5">
                Set how many of each luggage type this category can carry.
              </p>
            </div>

            {!ready ? (
              <p className="text-sm text-default-500">Loading luggage types...</p>
            ) : standardLuggage.length === 0 ? (
              <p className="text-sm text-default-500">
                No active luggage types found. Add some first.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {standardLuggage.map((item, index) => (
                  <StandardLuggageCard
                    key={item.id}
                    item={item}
                    quantity={standardCapacities?.[index]?.quantity ?? 0}
                    onQuantityChange={(quantity) =>
                      form.setValue(`standardLuggageCapacity.${index}.quantity`, quantity, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                ))}
              </div>
            )}

            {standardError ? <p className="text-xs text-destructive">{standardError}</p> : null}
          </div>

          {showStatus ? (
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-default-700">Active</p>
                <p className="text-xs text-default-500">
                  Show this category in booking and vehicle options
                </p>
              </div>
              <Input name="isActive" type="switch" switchSize="md" />
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !ready} isLoading={isPending}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
