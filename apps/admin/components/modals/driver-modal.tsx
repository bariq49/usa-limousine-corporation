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
import { useCreateDriver, useUpdateDriver } from "@/hooks/queries/use-drivers";
import { useUploadFile } from "@/hooks/queries/use-upload";
import { useCategories } from "@/hooks/queries/use-vehicle-categories";
import { driverSchema, type Schema as FormValues } from "@/lib/schemas/drivers";
import type { Driver } from "@/lib/types/drivers";

type DriverModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Driver | null;
  onSuccess?: () => void;
};

const EMPTY: FormValues = {
  avatar: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  vehicleCategoryId: "",
  licenseNumber: "",
  isActive: true,
};

export function DriverModal({ open, onOpenChange, initialData, onSuccess }: DriverModalProps) {
  const isEditing = Boolean(initialData);
  const createMutation = useCreateDriver();
  const updateMutation = useUpdateDriver();
  const uploadMutation = useUploadFile();
  const { data: categoriesData } = useCategories({ limit: 100 });

  const categoryOptions: InputOption[] = useMemo(
    () =>
      (categoriesData?.data ?? []).map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categoriesData],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(driverSchema),
    mode: "all",
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      initialData
        ? {
            avatar: initialData.user.avatar || "",
            firstName: initialData.user.firstName || "",
            lastName: initialData.user.lastName || "",
            email: initialData.user.email,
            phone: initialData.user.phone || "",
            vehicleCategoryId: initialData.vehicleCategoryId,
            licenseNumber: initialData.licenseNumber || "",
            isActive: initialData.status === "ACTIVE",
          }
        : EMPTY,
    );
  }, [initialData, form, open]);

  const handleUpload = async (file: File) => {
    const uploadResult = await uploadMutation.mutateAsync({ file, folder: "drivers" });
    return uploadResult.secureUrl || uploadResult.url;
  };

  const onSubmit = async (values: FormValues) => {
    const payload = {
      avatar: values.avatar || null,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email.toLowerCase(),
      phone: values.phone,
      vehicleCategoryId: values.vehicleCategoryId,
      licenseNumber: values.licenseNumber || null,
      status: values.isActive ? ("ACTIVE" as const) : ("INACTIVE" as const),
    };
    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      return;
    }
  };

  const isPending =
    createMutation.isPending || updateMutation.isPending || uploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-0 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Driver" : "Register Driver"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <Input
              name="avatar"
              label="Profile Photo (Optional)"
              type="upload"
              accept="image/*"
              onUpload={handleUpload}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input name="firstName" label="First Name" />
              <Input name="lastName" label="Last Name" />
            </div>

            <Input name="email" label="Email" type="email" />
            <Input name="phone" label="Phone Number" type="phone" />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                name="vehicleCategoryId"
                label="Vehicle Category"
                type="select"
                options={categoryOptions}
              />
              <Input name="licenseNumber" label="License Number (Optional)" />
            </div>

            <div className="flex items-center justify-between border-t border-border pt-2">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-default-700">Active</p>
                <p className="text-xs text-default-500">
                  Only active drivers can be assigned rides
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
                {isEditing ? "Update Driver" : "Register Driver"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
