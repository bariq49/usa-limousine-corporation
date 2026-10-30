import { type ReactNode } from "react";
import { cn } from "../utils/cn";
import { Breadcrumbs, type BreadcrumbItem } from "./breadcrumbs";

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 space-y-1">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">{actions}</div> : null}
    </div>
  );
}

