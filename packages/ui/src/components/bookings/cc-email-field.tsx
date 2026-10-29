"use client";

import { useEffect } from "react";
import { Mail } from "../../svg";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "../input";
import type { Step3FormValues } from "../../types/booking";

type Props = {
  className?: string;
  fieldClassName?: string;
};

export const CcEmailField = ({ className = "space-y-3", fieldClassName }: Props = {}) => {
  const { control, setValue } = useFormContext<Step3FormValues>();
  const isEnabled = useWatch({ control, name: "ccEmailEnabled" });

  useEffect(() => {
    if (!isEnabled) {
      setValue("ccEmail", "", { shouldDirty: false });
    }
  }, [isEnabled, setValue]);

  return (
    <div className={className}>
      <Input
        name="ccEmailEnabled"
        type="switch"
        className="flex h-12 items-center rounded-md border border-default-300 bg-card px-3 sm:h-10 2xl:h-12"
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
          label="CC Email"
          placeholder="Email to receive a copy of the booking"
          icon={<Mail width={16} height={16} className="text-gray-400" />}
          className={fieldClassName}
          required
        />
      ) : null}
    </div>
  );
};
