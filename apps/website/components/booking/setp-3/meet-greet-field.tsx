"use client";

import { useEffect } from "react";
import { User } from "@usa-limousine-corporation/ui/svg";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { formatPrice } from "@/lib/utils";
import { useSettings } from "@/hooks/queries/use-settings";
import type { Step3FormValues } from "@/types/booking.types";

type Props = {
  enabledField?: "meetGreetEnabled" | "returnMeetGreetEnabled";
  nameField?: "meetGreet" | "returnMeetGreet";
  label?: string;
  namePlaceholder?: string;
};

export const MeetGreetField = (props: Props = {}) => {
  const {
    enabledField = "meetGreetEnabled",
    nameField = "meetGreet",
    label = "Meet & Greet",
    namePlaceholder = "Name for Meet & Greet sign",
  } = props;

  const { control, setValue } = useFormContext<Step3FormValues>();
  const { data: bookingSettings } = useSettings();

  const meetGreetFee = bookingSettings?.meetAndGreetFee ?? 0;
  const isEnabled = useWatch({ control, name: enabledField });

  useEffect(() => {
    if (!isEnabled) {
      setValue(nameField, "", { shouldDirty: false });
    }
  }, [isEnabled, nameField, setValue]);

  if (!(meetGreetFee > 0)) return null;

  return (
    <div className="space-y-3">
      <Input
        name={enabledField}
        type="switch"
        className="rounded-sm border border-border p-3"
        label={
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-900">
              {label}
            </span>
            <span className="text-sm font-medium text-secondary">
              ({formatPrice(meetGreetFee)})
            </span>
          </span>
        }
      />

      {isEnabled ? (
        <Input
          name={nameField}
          placeholder={namePlaceholder}
          icon={<User width={16} height={16} className="text-gray-400" />}
          required
        />
      ) : null}
    </div>
  );
};
