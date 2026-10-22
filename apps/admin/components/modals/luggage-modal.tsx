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
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { APP_CURRENCY } from "@usa-limousine-corporation/ui/constants";
import { useCreateLuggage, useUpdateLuggage } from "@/hooks/queries/use-luggage";
import { useUploadFile } from "@/hooks/queries/use-upload";
import { luggageSchema, type Schema as FormValues } from "@/lib/schemas/luggage";
import type { Item } from "@/lib/types/luggage";

type LuggageModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Item | null;
  onSuccess?: () => void;
};

export function LuggageModal({ open, onOpenChange, initialData, onSuccess }: LuggageModalProps) {
  const isEditing = Boolean(initialData);

  const createMutation = useCreateLuggage();
  const updateMutation = useUpdateLuggage();
  const uploadMutation = useUploadFile();

  const form = useForm<FormValues>({
    resolver: zodResolver(luggageSchema),
    mode: "all",
    defaultValues: {
      name: "",
      description: "",
      dimensions: "",
      image: "",
      price: undefined,
      isActive: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        description: initialData.description || "",
        dimensions: initialData.dimensions || "",
        image: initialData.image || "",
        price: initialData.price != null ? Number(initialData.price) : undefined,
        isActive: initialData.isActive,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        dimensions: "",
        image: "",
        price: undefined,
        isActive: true,
      });
    }
  }, [initialData, form, open]);

  const handleUpload = async (file: File) => {
    const uploadResult = await uploadMutation.mutateAsync({
      file,
      folder: "luggage",
    });
    return uploadResult.secureUrl || uploadResult.url;
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        dimensions: values.dimensions?.trim() || undefined,
        image: values.image?.trim() || undefined,
        price: values.price !== undefined && values.price !== null ? Number(values.price) : null,
        isActive: values.isActive,
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

  const title = isEditing ? "Edit Luggage" : "Add Luggage";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <Input
              name="image"
              label="Luggage Image (Optional)"
              type="upload"
              accept="image/*"
              onUpload={handleUpload}
            />

            <Input name="name" label="Luggage Name" />

            <div className="grid grid-cols-2 gap-3">
              <Input
                name="price"
                label={`Price (${APP_CURRENCY})`}
                type="number"
                step="0.01"
                min="0"
              />
              <Input name="dimensions" label="Dimensions (Optional)" />
            </div>

            <Input name="description" label="Description" />

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-default-700">Active</p>
                <p className="text-xs text-default-500">
                  Display this luggage type in vehicle capacity options
                </p>
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
                {isEditing ? "Update Luggage" : "Add Luggage"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
