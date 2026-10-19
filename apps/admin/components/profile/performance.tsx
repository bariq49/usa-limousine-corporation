"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { TabsContent } from "@usa-limousine-corporation/ui/components/tabs";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { PerformanceFilters } from "@/components/profile/performance-filters";
import { PerformanceSkeleton } from "@/components/skeletons/performance-skeleton";
import { usePerformance } from "@/hooks/queries/use-drivers";
import { defaults, toQuery } from "@/lib/schemas/performance-filters";
import type { Params } from "@/lib/types/drivers";

type Props = {
  driverId: string;
};

const REASON_ROWS = [
  { key: "youCancelled" as const, label: "Driver cancelled", color: "bg-rose-500" },
  { key: "youDidNotAccept" as const, label: "Did not accept", color: "bg-default-400" },
  { key: "clientCancelled" as const, label: "Client cancelled", color: "bg-amber-400" },
  { key: "clientNoShow" as const, label: "Client did not show", color: "bg-emerald-500" },
];

export function Performance(props: Props) {
  const { driverId } = props;
  const [applied, setApplied] = useState<Params>(() => toQuery(defaults()));

  const { data, isLoading, isFetching } = usePerformance(driverId, applied);
  const maxIncoming = Math.max(1, ...(data?.series.map((b) => b.incoming) ?? [1]));

  if (isLoading) {
    return (
      <TabsContent value="performance">
        <PerformanceSkeleton />
      </TabsContent>
    );
  }

  return (
    <TabsContent value="performance">
      <div className="flex flex-col gap-6">
        <PerformanceFilters onApply={setApplied} isApplying={isFetching} />

        {data ? (
          <p className="text-xs text-default-500">
            Showing {data.startDate} → {data.endDate} · grouped by {data.groupBy}
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card className="rounded-md border border-border shadow-xs lg:col-span-4">
            <CardContent className="flex h-full flex-col items-center justify-center p-6 text-center">
              <div className="text-5xl font-bold text-default-900">
                {data?.acceptanceRate ?? 0}%
              </div>
              <p className="mt-2 text-sm text-default-500">Acceptance rate</p>
              <p className="mt-4 text-xs text-default-400">
                {data?.finishedRides ?? 0} finished / {data?.incomingRequests ?? 0} incoming
                requests
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-md border border-border shadow-xs lg:col-span-8">
            <CardHeader className="border-b border-border/70 px-6 py-4">
              <CardTitle className="text-base font-semibold text-default-900">
                Finished rides from incoming requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {(data?.series.length ?? 0) === 0 ? (
                <p className="py-12 text-center text-sm text-default-500">
                  No buckets for this filter window.
                </p>
              ) : (
                <div className="flex h-52 items-end gap-2 overflow-x-auto sm:gap-3">
                  {(data?.series ?? []).map((bucket) => {
                    const heightPct = Math.max(
                      bucket.incoming > 0 ? 8 : 0,
                      Math.round((bucket.incoming / maxIncoming) * 100),
                    );
                    const finishedPct =
                      bucket.incoming > 0
                        ? Math.round((bucket.finished / bucket.incoming) * 100)
                        : 0;
                    return (
                      <div
                        key={bucket.key}
                        className="flex min-w-[40px] flex-1 flex-col items-center gap-2"
                      >
                        <div className="relative flex h-40 w-full max-w-[64px] items-end justify-center">
                          {bucket.incoming > 0 ? (
                            <div
                              className="relative w-full overflow-hidden rounded-t-md bg-rose-200"
                              style={{ height: `${heightPct}%` }}
                              title={`${bucket.finished} / ${bucket.incoming}`}
                            >
                              <div
                                className="absolute bottom-0 left-0 right-0 bg-emerald-500"
                                style={{ height: `${finishedPct}%` }}
                              />
                            </div>
                          ) : (
                            <div className="h-1 w-full rounded bg-default-100" />
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-semibold text-default-800">
                            {bucket.finished}/{bucket.incoming}
                          </p>
                          <p className="text-[10px] text-default-500">{bucket.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="mt-4 text-xs text-default-400">
                Green = finished rides · Red = remaining incoming requests
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-md border border-border shadow-xs">
          <CardHeader className="border-b border-border/70 px-6 py-4">
            <CardTitle className="text-base font-semibold text-default-900">
              Reasons for past {data?.cancelReasons.total ?? 0} cancelled / missed requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                {REASON_ROWS.map((row) => {
                  const item = data?.cancelReasons[row.key];
                  return (
                    <div key={row.key} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className={cn("h-3 w-3 rounded-sm", row.color)} />
                        <span className="text-sm text-default-700">{row.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-default-900">
                        {item?.percent ?? 0}%
                        <span className="ml-2 text-xs font-normal text-default-400">
                          ({item?.count ?? 0})
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-default-100">
                {REASON_ROWS.map((row) => {
                  const pct = data?.cancelReasons[row.key]?.percent ?? 0;
                  if (pct <= 0) {
                    return null;
                  }
                  return (
                    <div
                      key={row.key}
                      className={cn("h-full", row.color)}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
