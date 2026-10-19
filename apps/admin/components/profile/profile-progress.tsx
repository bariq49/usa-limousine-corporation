"use client";

import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import type { Driver } from "@/lib/types/drivers";
import { getProfileCompletion } from "@/lib/utils/profile-completion";

export interface ProfileProgressProps {
  driver?: Driver | null | undefined;
}

export function ProfileProgress({ driver }: ProfileProgressProps) {
  if (!driver) {
    return (
      <Card className="h-fit w-full shadow-xs border border-border">
        <CardContent className="p-6">
          <div className="flex flex-col gap-3">
            <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-end">
                <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { percentage, completedCount, totalCount, missing } = getProfileCompletion(driver);

  return (
    <Card className="h-fit w-full shadow-xs border border-border">
      <CardContent className="p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="text-base font-semibold text-default-900">Profile Completion</div>
            <div className="text-xs font-medium text-default-500 whitespace-nowrap">
              {completedCount}/{totalCount} checks
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-end text-sm font-semibold text-default-700">
              {percentage}% Completed
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{
                  width: `${percentage}%`,
                  backgroundImage:
                    "linear-gradient(45deg, rgba(255, 255, 255, 0.2) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.2) 75%, transparent 75%, transparent)",
                  backgroundSize: "1rem 1rem",
                }}
              />
            </div>
          </div>

          {missing.length > 0 && (
            <p className="text-xs text-default-500 leading-relaxed">
              Missing: {missing.map((item) => item.label).join(", ")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
