"use client";

import { useEffect } from "react";
import { User } from "../../svg";
import { useFormContext, useWatch } from "react-hook-form";
import { Input } from "../input";
import { useSettings } from "../../hooks/use-booking";
import type { Step3FormValues } from "../../types/booking";
import { formatPrice } from "../../utils/price";

type Props = {
  enabledField?: "meetGreetEnabled" | "returnMeetGreetEnabled";
  nameField?: "meetGreet" | "returnMeetGreet";
  label?: string;
  namePlaceholder?: string;
  nameLabel?: string;
  className?: string;
  fieldClassName?: string;
};

export const MeetGreetField = (props: Props = {}) => {
  const {
    enabledField = "meetGreetEnabled",
    nameField = "meetGreet",
    label = "Meet & Greet",
    namePlaceholder = "Name for Meet & Greet sign",
    nameLabel = "Sign Name",
    className = "space-y-3",
    fieldClassName,
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
    <div className={className}>
      <Input
        name={enabledField}
        type="switch"
        className="flex h-12 items-center rounded-md border border-default-300 bg-card px-3 sm:h-10 2xl:h-12"
        label={
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium uppercase tracking-wide text-gray-900">
              {label}
            </span>
            <span className="text-sm font-medium text-secondary">
              ({formatPrice({ price: meetGreetFee })})
            </span>
          </span>
        }
      />

      {isEnabled ? (
        <Input
          name={nameField}
          label={nameLabel}
          placeholder={namePlaceholder}
          icon={<User width={16} height={16} className="text-gray-400" />}
          className={fieldClassName}
          required
        />
      ) : null}
    </div>
  );
};
