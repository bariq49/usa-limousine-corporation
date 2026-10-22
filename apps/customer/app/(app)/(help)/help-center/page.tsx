"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { PageHeader } from "@usa-limousine-corporation/ui/layout/page-header";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { NewTicketDialog } from "@/components/help-center/new-ticket-dialog";
import { useTickets } from "@/hooks/queries/use-tickets";
import type { TicketStatus } from "@/lib/api/types";
import { CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils/ticket-labels";

const PAGE_SIZE = 10;
const FILTERS: { value: TicketStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export default function HelpCenterPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TicketStatus | undefined>(undefined);
  const { data, isLoading } = useTickets({ page, limit: PAGE_SIZE, status });
  const tickets = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          title="Help Center"
          description="Create a support ticket and follow the conversation with our team."
          breadcrumbs={[
            { label: "Home", href: "/dashboard" },
            { label: "Settings" },
            { label: "Help Center" },
          ]}
        />
        <NewTicketDialog onCreated={(id) => router.push(`/help-center/${id}`)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => {
              setStatus(filter.value);
              setPage(1);
            }}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              status === filter.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-default-600 hover:text-primary",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <Card className="shadow-xs">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-default-800">No tickets yet</p>
              <p className="mt-1 text-sm text-default-500">
                Need help with a booking or your account? Create a ticket and we&apos;ll get back to
                you.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {tickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/help-center/${ticket.id}`}
                    className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-default-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-default-900">
                        {ticket.subject}
                      </p>
                      <p className="mt-0.5 text-xs text-default-500">
                        {ticket.ticketNumber} · {CATEGORY_LABELS[ticket.category]} ·{" "}
                        {formatDate({ date: ticket.createdAt })}
                      </p>
                    </div>
                    <Badge color={STATUS_COLORS[ticket.status]} variant="soft" className="w-fit">
                      {STATUS_LABELS[ticket.status]}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {data && data.pages > 1 ? (
        <div className="flex items-center justify-end gap-3 text-sm text-default-600">
          <span>
            Page {data.page} of {data.pages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!data.hasPrevPage}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!data.hasNextPage}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
