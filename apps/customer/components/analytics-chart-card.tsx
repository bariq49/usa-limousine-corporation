"use client";

import type { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@usa-limousine-corporation/ui/components/card";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";

export function AnalyticsChartCard(props: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "min-w-0 w-full rounded-md border-none bg-transparent shadow-none md:border md:border-border/50 md:bg-card",
        props.className,
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 px-0 py-2 md:px-4 md:py-3">
        <div className="min-w-0 space-y-0.5">
          <div className="text-sm font-semibold text-default-900">{props.title}</div>
          {props.description ? (
            <p className="text-xs text-default-500">{props.description}</p>
          ) : null}
        </div>
        {props.actions ? <div className="shrink-0">{props.actions}</div> : null}
      </CardHeader>
      <CardContent className="min-w-0 w-full px-0 py-2 md:p-4">
        <div className="min-w-0 w-full">{props.children}</div>
      </CardContent>
    </Card>
  );
}
