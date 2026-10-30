"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "../button";
import { Form } from "../form";
import { Input } from "../input";
import { changePasswordSchema, type ChangePasswordSchema } from "../../schemas";

const defaultValues: ChangePasswordSchema = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export interface ChangePasswordFormProps {
  onSubmit?: ((values: ChangePasswordSchema) => Promise<void> | void) | undefined;
  isSubmitting?: boolean | undefined;
}

export function ChangePasswordForm({ onSubmit, isSubmitting }: ChangePasswordFormProps = {}) {
  const form = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
    mode: "all",
    defaultValues,
  });

  const handleSubmit = async (values: ChangePasswordSchema) => {
    if (onSubmit) {
      await onSubmit(values);
      form.reset(defaultValues);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-1 flex-col justify-between"
      >
        <div className="grid grid-cols-12 gap-y-5 md:gap-x-6">
          <div className="col-span-12">
            <Input
              name="currentPassword"
              label="Current Password"
              placeholder="Enter your current password"
              type="password"
              autoComplete="current-password"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input
              name="newPassword"
              label="New Password"
              placeholder="Enter a new password"
              type="password"
              autoComplete="new-password"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Input
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter your new password"
              type="password"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => form.reset(defaultValues)}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !onSubmit}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
}
