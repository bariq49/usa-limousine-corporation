"use client";

import { useEffect } from "react";
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
import { APP_CURRENCY } from "@usa-limousine-corporation/ui/constants";
import { useCreateService, useUpdateService } from "@/hooks/queries/use-services";
import { useUploadFile } from "@/hooks/queries/use-upload";
import { serviceSchema, type Schema as FormValues } from "@/lib/schemas/services";
import type { Item } from "@/lib/types/services";

type ServiceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Item | null;
  onSuccess?: () => void;
};

const serviceTypeOptions: InputOption[] = [
  { label: "Child Seat", value: "CHILD_SEAT" },
  { label: "Meet & Greet", value: "MEET_AND_GREET" },
  { label: "Extra Service", value: "EXTRA" },
];

export function ServiceModal({ open, onOpenChange, initialData, onSuccess }: ServiceModalProps) {
  const isEditing = Boolean(initialData);
  const createMutation = useCreateService();
  const updateMutation = useUpdateService();
  const uploadMutation = useUploadFile();

  const form = useForm<FormValues>({
    resolver: zodResolver(serviceSchema),
    mode: "all",
    defaultValues: {
      name: "",
      image: "",
      price: 0,
      type: "EXTRA",
      maxQuantity: 1,
      description: "",
      isActive: true,
      sortOrder: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        image: initialData.image || "",
        price: Number(initialData.price || 0),
        type: initialData.type,
        maxQuantity: initialData.maxQuantity,
        description: initialData.description || "",
        isActive: initialData.isActive,
        sortOrder: initialData.sortOrder,
      });
    } else {
      form.reset({
        name: "",
        image: "",
        price: 0,
        type: "CHILD_SEAT",
        maxQuantity: 4,
        description: "",
        isActive: true,
        sortOrder: 0,
      });
    }
  }, [initialData, form, open]);

  const handleUpload = async (file: File) => {
    const uploadResult = await uploadMutation.mutateAsync({
      file,
      folder: "services",
    });
    return uploadResult.secureUrl || uploadResult.url;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name.trim(),
        image: values.image?.trim() || undefined,
        price: values.price,
        type: values.type,
        maxQuantity: values.maxQuantity,
        description: values.description?.trim() || undefined,
        isActive: values.isActive,
        sortOrder: values.sortOrder,
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
      // Error handled in hook toast
    }
  };

  const isPending =
    createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Service" : "Add Extra Service"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <Input
              name="image"
              label="Service Image (Optional)"
              type="upload"
              accept="image/*"
              onUpload={handleUpload}
            />

            <Input name="name" label="Service Name" />

            <div className="grid grid-cols-2 gap-3">
              <Input name="type" label="Type" type="select" options={serviceTypeOptions} />
              <Input
                name="price"
                label={`Price (${APP_CURRENCY})`}
                type="number"
                step="0.01"
                min="0"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input name="maxQuantity" label="Max Quantity" type="number" min="1" max="100" />
              <Input name="sortOrder" label="Sort Order" type="number" min="0" />
            </div>

            <Input name="description" label="Description" type="textarea" />

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-default-700">Active</p>
                <p className="text-xs text-default-500">Display this service in booking options</p>
              </div>
              <Input name="isActive" type="switch" switchSize="md" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} isLoading={isPending}>
                {isEditing ? "Update Service" : "Add Service"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
