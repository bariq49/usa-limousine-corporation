"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { User, Globe, Mail } from "@usa-limousine-corporation/ui/svg";
import type { Driver } from "@/lib/types/drivers";

export interface AboutCardProps {
  driver?: Driver | null | undefined;
}

export function AboutCard({ driver }: AboutCardProps) {
  return (
    <Card className="h-fit w-full shadow-xs border border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-default-900">About</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2 space-y-6">
        <p className="text-sm leading-relaxed text-default-600 whitespace-pre-line">
          {driver?.about || "—"}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-default-500">Shift Type</div>
              <div className="truncate text-sm font-semibold text-default-800 capitalize">
                {(() => {
                  const shift = driver?.shift?.toUpperCase();
                  if (!shift) return "—";
                  const label = shift.charAt(0) + shift.slice(1).toLowerCase();
                  if (
                    (shift === "DAY" || shift === "NIGHT") &&
                    driver?.startTime &&
                    driver?.endTime
                  ) {
                    return `${label} (${driver.startTime} – ${driver.endTime})`;
                  }
                  return label;
                })()}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Globe className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-default-500">Service Area</div>
              <div className="truncate text-sm font-semibold text-default-800">
                {driver?.operatingCity || driver?.city || "—"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-default-500">Mail</div>
              <div className="truncate text-sm font-semibold text-default-800">
                {driver?.email || "—"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
