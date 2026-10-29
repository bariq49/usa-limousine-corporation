"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "../input";
import { useSettings } from "../../hooks/use-booking";
import { cn } from "../../utils/cn";
import type { Step3FormValues } from "../../types/booking";
import { formatPrice } from "../../utils/price";

const CHANNELS = [
  {
    name: "notifyByEmail",
    label: "Email & App notifications",
    hint: "Booking confirmation and trip updates by email.",
    feeKey: "emailNotificationFee",
  },
  {
    name: "notifyBySms",
    label: "SMS notifications",
    hint: "Booking confirmation and trip updates by text message.",
    feeKey: "smsNotificationFee",
  },
] as const;

export const NotificationsField = () => {
  const { data: settings } = useSettings();
  const { setValue } = useFormContext<Step3FormValues>();
  const isEmailFree = (settings?.emailNotificationFee ?? 0) <= 0;

  useEffect(() => {
    if (isEmailFree) setValue("notifyByEmail", true, { shouldDirty: false });
  }, [isEmailFree, setValue]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold tracking-tight text-black">Notifications</h3>
      <div className="space-y-2">
        {CHANNELS.map((channel) => {
          const fee = settings?.[channel.feeKey] ?? 0;
          return (
            <div
              key={channel.name}
              className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Input
                  name={channel.name}
                  type="switch"
                  disabled={channel.name === "notifyByEmail" && isEmailFree}
                />
                <label htmlFor={channel.name} className="flex min-w-0 cursor-pointer flex-col">
                  <span className="text-sm font-medium text-black">{channel.label}</span>
                  <span className="text-xs font-normal text-gray-500">{channel.hint}</span>
                </label>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                  fee > 0
                    ? "border border-secondary text-secondary"
                    : "bg-success/10 text-success",
                )}
              >
                {fee > 0 ? `+ ${formatPrice({ price: fee })}` : "Free"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
