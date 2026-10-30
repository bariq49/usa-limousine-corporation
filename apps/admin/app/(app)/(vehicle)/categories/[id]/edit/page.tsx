"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Car } from "@usa-limousine-corporation/ui/svg";
import { useCategory, useUpdateCategory } from "@/hooks/queries/use-vehicle-categories";
import { VehicleCategoryForm } from "@/components/forms/vehicle-category-form";
import type { Schema as FormValues } from "@/lib/schemas/vehicle-category";
import type { UpdatePayload } from "@/lib/types/vehicle-categories";

export default function EditVehicleCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: category, isLoading, isError } = useCategory(id);
  const update = useUpdateCategory();

  const existingCapacities = useMemo(
    () =>
      (category?.luggageCapacity ?? []).map((item) => ({
        luggageTypeId: item.luggageTypeId,
        quantity: item.quantity,
      })),
    [category?.luggageCapacity],
  );

  const initialValues = useMemo<Partial<FormValues> | undefined>(() => {
    if (!category) return undefined;
    return {
      name: category.name,
      models: category.models ?? "",
      description: category.description ?? "",
      image: category.image ?? "",
      passengerCount: category.passengerCount,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    };
  }, [category]);

  const onSubmit = async (values: FormValues) => {
    try {
      const standardLuggageCapacity = values.standardLuggageCapacity.filter(
        (item) => item.quantity > 0,
      );

      const payload: UpdatePayload = {
        name: values.name.trim(),
        models: values.models?.trim() || null,
        description: values.description?.trim() || null,
        image: values.image?.trim() || null,
        passengerCount: values.passengerCount,
        sortOrder: values.sortOrder,
        isActive: values.isActive,
        standardLuggageCapacity,
      };

      await update.mutateAsync({ id, payload });
      router.push("/categories");
    } catch {
      // Error handled in hook toast
    }
  };

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Vehicle" },
          { label: "Categories", href: "/categories" },
          { label: "Edit Category" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-10 gap-2 px-3"
          onClick={() => router.push("/categories")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex min-h-10 min-w-0 flex-1 items-center justify-between gap-3 rounded-md border border-border border-r-2 border-r-primary bg-card px-4 py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Car className="h-5 w-5 shrink-0 text-primary" />
            <h2 className="truncate text-sm font-semibold text-default-900 sm:text-base">
              {category?.name ? `Edit Category - ${category.name}` : "Edit Category"}
            </h2>
          </div>
          {category ? (
            <Badge
              color={category.isActive ? "success" : "secondary"}
              variant="soft"
              className="shrink-0 text-xs font-semibold"
            >
              {category.isActive ? "Active" : "Inactive"}
            </Badge>
          ) : null}
        </div>
      </div>

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          {isLoading ? (
            <p className="text-sm text-default-500">Loading category...</p>
          ) : isError || !category || !initialValues ? (
            <p className="text-sm text-destructive">Category not found or failed to load.</p>
          ) : (
            <VehicleCategoryForm
              key={category.id}
              subtitle="Update passenger capacity, luggage limits, and category details."
              submitLabel="Save Changes"
              pending={update.isPending}
              showStatus
              initialValues={initialValues}
              existingCapacities={existingCapacities}
              onSubmit={onSubmit}
              onCancel={() => router.push("/categories")}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
