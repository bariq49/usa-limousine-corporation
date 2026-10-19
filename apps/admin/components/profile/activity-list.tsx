"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { Search } from "lucide-react";
import { useActivity } from "@/hooks/queries/use-drivers";
import { buildTimeline, filterTimeline } from "@/lib/utils/activity-timeline";
import { ActivitySkeleton } from "@/components/skeletons/activity-skeleton";
import { ActivityTimelineRow } from "./activity-timeline-row";

type Props = {
  driverId: string;
};

export function ActivityList(props: Props) {
  const { driverId } = props;
  const { data, isLoading } = useActivity(driverId);
  const [search, setSearch] = useState("");

  const items = useMemo(() => buildTimeline({ activity: data?.data }), [data?.data]);

  const filtered = useMemo(() => filterTimeline({ items, search }), [items, search]);

  return (
    <Card className="shadow-xs border border-border">
      <CardHeader className="border-b border-border/70 px-6 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base font-semibold tracking-tight text-default-900 sm:text-lg">
            Recent Activity
          </CardTitle>
          <div className="relative w-full sm:max-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-default-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="h-9 w-full rounded-full border border-border bg-default-50/80 pl-9 pr-3 text-sm text-default-700 placeholder:text-default-400 transition-colors focus:border-primary focus:bg-card focus:outline-hidden"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-6 py-5">
        {isLoading ? (
          <ActivitySkeleton />
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-default-500">
            {search.trim() ? "No matching activity found." : "No recent activity yet."}
          </p>
        ) : (
          <ul className="space-y-0">
            {filtered.map((item, index) => (
              <ActivityTimelineRow
                key={item.id}
                item={item}
                isLast={index === filtered.length - 1}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
