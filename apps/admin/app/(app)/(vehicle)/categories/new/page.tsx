"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Car } from "@usa-limousine-corporation/ui/svg";
import { useCreateCategory } from "@/hooks/queries/use-vehicle-categories";
import { VehicleCategoryForm } from "@/components/forms/vehicle-category-form";
import type { Schema as FormValues } from "@/lib/schemas/vehicle-category";
import type { CreatePayload } from "@/lib/types/vehicle-categories";

export default function CreateVehicleCategoryPage() {
  const router = useRouter();
  const create = useCreateCategory();

  const onSubmit = async (values: FormValues) => {
    try {
      const standardLuggageCapacity = values.standardLuggageCapacity.filter(
        (item) => item.quantity > 0,
      );

      const payload: CreatePayload = {
        name: values.name.trim(),
        passengerCount: values.passengerCount,
        standardLuggageCapacity,
      };

      const description = values.description?.trim();
      if (description) payload.description = description;

      const image = values.image?.trim();
      if (image) payload.image = image;

      await create.mutateAsync(payload);
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
          { label: "Create Category" },
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

        <div className="flex min-h-10 min-w-0 flex-1 items-center gap-2.5 rounded-md border border-border border-r-2 border-r-primary bg-card px-4 py-2">
          <Car className="h-5 w-5 shrink-0 text-primary" />
          <h2 className="truncate text-sm font-semibold text-default-900 sm:text-base">
            Create Category
          </h2>
        </div>
      </div>

      <Card className="shadow-xs border border-border bg-card">
        <CardContent className="p-6">
          <VehicleCategoryForm
            subtitle="Add a new vehicle category with passenger capacity and luggage limits."
            submitLabel="Create Category"
            pending={create.isPending}
            onSubmit={onSubmit}
            onCancel={() => router.push("/categories")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
