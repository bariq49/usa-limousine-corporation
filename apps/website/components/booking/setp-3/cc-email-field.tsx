"use client";

import { useEffect } from "react";
import { Mail } from "@usa-limousine-corporation/ui/svg";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import type { Step3FormValues } from "@/types/booking.types";

export const CcEmailField = () => {
  const { control, setValue } = useFormContext<Step3FormValues>();
  const isEnabled = useWatch({ control, name: "ccEmailEnabled" });

  useEffect(() => {
    if (!isEnabled) {
      setValue("ccEmail", "", { shouldDirty: false });
    }
  }, [isEnabled, setValue]);

  return (
    <div className="space-y-3">
      <Input
        name="ccEmailEnabled"
        type="switch"
        className="rounded-sm border border-border p-3"
        label={
          <span className="text-sm font-medium uppercase tracking-wide text-gray-900">
            CC Email
          </span>
        }
      />

      {isEnabled ? (
        <Input
          name="ccEmail"
          type="email"
          placeholder="Email to receive a copy of the booking"
          icon={<Mail width={16} height={16} className="text-gray-400" />}
          required
        />
      ) : null}
    </div>
  );
};
