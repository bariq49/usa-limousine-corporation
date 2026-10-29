"use client";

import { useEffect, useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import {
  Calendar,
  CalendarClock,
  Grid,
  Hash,
  Support,
  Tag,
  User,
} from "@usa-limousine-corporation/ui/svg";
import { AttachmentPreview } from "@/components/help-center/attachment-preview";
import { TicketActionSteps } from "@/components/help-center/ticket-action-steps";
import { TicketActivityTimeline } from "@/components/help-center/ticket-activity-timeline";
import {
  useReplyToTicket,
  useTicket,
  useUpdateTicketPriority,
  useUpdateTicketStatus,
} from "@/hooks/queries/use-tickets";
import type { TicketPriority, TicketStatus } from "@/lib/types/tickets";
import { buildTicketActivity } from "@/lib/utils/ticket-activity";
import {
  PRIORITY_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
  formatCategory,
  nextStatuses,
  priorityBadgeColor,
  statusBadgeColor,
  ticketOwner,
} from "@/lib/utils/ticket-labels";

type StatusForm = {
  status: TicketStatus;
  note: string;
};

type PriorityForm = {
  priority: TicketPriority;
};

type ReplyForm = {
  body: string;
};

const crumbs = [
  { label: "Home", href: "/analytics" },
  { label: "Help Center", href: "/help-center" },
  { label: "Detail" },
];

function DetailRow(props: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex w-[110px] shrink-0 items-center gap-2">
        {props.icon}
        <span className="text-sm font-semibold text-default-800">{props.label}</span>
      </div>
      <div className="min-w-0 flex-1 text-sm text-default-700">{props.children}</div>
    </li>
  );
}

export default function HelpCenterTicketPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const ticketId = params.id;
  const { data: ticket, isLoading, isError } = useTicket(ticketId);
  const statusMutation = useUpdateTicketStatus(ticketId);
  const priorityMutation = useUpdateTicketPriority(ticketId);
  const replyMutation = useReplyToTicket(ticketId);

  const activityItems = useMemo(() => buildTicketActivity(ticket?.events), [ticket?.events]);

  const statusForm = useForm<StatusForm>({
    defaultValues: { status: "OPEN", note: "" },
  });

  const priorityForm = useForm<PriorityForm>({
    defaultValues: { priority: "MEDIUM" },
  });

  const replyForm = useForm<ReplyForm>({
    defaultValues: { body: "" },
  });

  useEffect(() => {
    if (!ticket) return;
    const next = nextStatuses(ticket.status);
    statusForm.reset({ status: next[0] ?? ticket.status, note: "" });
    priorityForm.reset({ priority: ticket.priority });
  }, [ticket, statusForm, priorityForm]);

  const canReply = Boolean(ticket) && ticket?.status !== "RESOLVED" && ticket?.status !== "CLOSED";
  const replyBody = replyForm.watch("body");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={crumbs} />
        <div className="h-10 animate-pulse rounded-md bg-default-100" />
        <Card className="border border-border shadow-xs">
          <CardContent className="space-y-3 p-6">
            <div className="h-5 w-48 animate-pulse rounded bg-default-200" />
            <div className="h-16 w-full animate-pulse rounded bg-default-100" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="space-y-4">
        <Breadcrumbs items={crumbs} />
        <Card className="border border-border shadow-xs">
          <CardContent className="space-y-3 p-6">
            <h2 className="text-lg font-bold text-default-900">Ticket not found</h2>
            <p className="text-sm text-default-500">
              This ticket may have been removed or the link is invalid.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/help-center">Back to tickets</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const messages = ticket.messages ?? [];
  const owner = ticketOwner(ticket);

  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-10 gap-2 px-3"
          onClick={() => router.push("/help-center")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex min-h-10 min-w-0 flex-1 items-center justify-between gap-3 rounded-md border border-border border-r-2 border-r-primary bg-card px-4 py-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <Support className="h-5 w-5 shrink-0 text-primary" />
            <h2 className="truncate text-sm font-semibold text-default-900 sm:text-base">
              {ticket.ticketNumber}
            </h2>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            <Badge
              color="secondary"
              variant="soft"
              className="hidden text-xs font-semibold sm:inline-flex"
            >
              {formatCategory(ticket.category)}
            </Badge>
            <Badge
              color={statusBadgeColor(ticket.status)}
              variant="soft"
              className="text-xs font-semibold"
            >
              {STATUS_LABELS[ticket.status]}
            </Badge>
            <Badge
              color={priorityBadgeColor(ticket.priority)}
              variant="soft"
              className="text-xs font-semibold"
            >
              {PRIORITY_LABELS[ticket.priority]}
            </Badge>
          </div>
        </div>
      </div>

      <Card className="border border-border shadow-xs">
        <CardContent className="p-5 sm:p-6">
          <TicketActionSteps
            currentStatus={ticket.status}
            currentPriority={ticket.priority}
            statusForm={statusForm}
            priorityForm={priorityForm}
            statusPending={statusMutation.isPending}
            priorityPending={priorityMutation.isPending}
            onSaveStatus={(values) => {
              if (values.status === ticket.status) return;
              const note = values.note.trim();
              const payload = note ? { status: values.status, note } : { status: values.status };
              statusMutation.mutate(payload, {
                onSuccess: () => {
                  const next = nextStatuses(values.status);
                  statusForm.reset({
                    status: next[0] ?? values.status,
                    note: "",
                  });
                },
              });
            }}
            onSavePriority={(values) => {
              if (values.priority === ticket.priority) return;
              priorityMutation.mutate({ priority: values.priority });
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
        <div className="flex flex-col gap-4 lg:col-span-7 xl:col-span-8">
          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-default-900">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 sm:p-6 sm:pt-2">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-default-700">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-default-900">
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 sm:p-6 sm:pt-2">
              {messages.length === 0 ? (
                <p className="text-sm text-default-500">No messages yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-md border border-border px-3 py-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-medium text-default-700">
                          {message.author?.email ||
                            (message.authorUserId ? message.authorUserId : owner.name)}
                        </span>
                        <span className="text-xs text-default-400">
                          {formatDate({ date: message.createdAt })}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm whitespace-pre-wrap text-default-800">
                        {message.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {canReply ? (
                <div className="mt-5 border-t border-border pt-4">
                  <Form {...replyForm}>
                    <form
                      className="space-y-3"
                      onSubmit={replyForm.handleSubmit((values) => {
                        const body = values.body.trim();
                        if (!body) return;
                        replyMutation.mutate(
                          { body },
                          { onSuccess: () => replyForm.reset({ body: "" }) },
                        );
                      })}
                    >
                      <Input
                        name="body"
                        label="Reply"
                        type="textarea"
                        rows={3}
                        disabled={replyMutation.isPending}
                      />
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!replyBody?.trim() || replyMutation.isPending}
                          isLoading={replyMutation.isPending}
                        >
                          Send reply
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              ) : (
                <p className="mt-5 border-t border-border pt-4 text-xs text-default-500">
                  {ticket.status === "CLOSED"
                    ? "Replies are disabled. This ticket is closed."
                    : "Replies are disabled while the ticket is resolved. Reopen to continue."}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border border-border shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-default-900">
                Recent activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-2 sm:p-6 sm:pt-2">
              <TicketActivityTimeline items={activityItems} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="border border-border shadow-xs lg:sticky lg:top-4">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Support className="h-5 w-5 text-primary" />
                <CardTitle className="text-base font-semibold text-default-900">
                  Ticket details
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-1 sm:p-6 sm:pt-1">
              <ul className="space-y-3.5">
                <DetailRow icon={<Hash className="h-4 w-4 shrink-0 text-primary" />} label="Ticket">
                  <span className="break-words font-mono text-default-900">
                    {ticket.ticketNumber}
                  </span>
                </DetailRow>
                <DetailRow
                  icon={<Grid className="h-4 w-4 shrink-0 text-primary" />}
                  label="Category"
                >
                  {formatCategory(ticket.category)}
                </DetailRow>
                <DetailRow
                  icon={<CalendarClock className="h-4 w-4 shrink-0 text-primary" />}
                  label="Status"
                >
                  <Badge
                    color={statusBadgeColor(ticket.status)}
                    variant="soft"
                    className="text-xs font-semibold"
                  >
                    {STATUS_LABELS[ticket.status]}
                  </Badge>
                </DetailRow>
                <DetailRow
                  icon={<Tag className="h-4 w-4 shrink-0 text-primary" />}
                  label="Priority"
                >
                  <Badge
                    color={priorityBadgeColor(ticket.priority)}
                    variant="soft"
                    className="text-xs font-semibold"
                  >
                    {PRIORITY_LABELS[ticket.priority]}
                  </Badge>
                </DetailRow>
                <DetailRow icon={<User className="h-4 w-4 shrink-0 text-primary" />} label="Owner">
                  <div className="break-words">
                    <div className="text-xs text-default-500">
                      {ticket.customer ? "Customer" : "Website visitor"} ·{" "}
                      {SOURCE_LABELS[ticket.source] ?? ticket.source}
                    </div>
                    <span className="font-medium text-default-900">{owner.name}</span>
                    <a
                      href={`mailto:${owner.email}`}
                      className="block text-default-500 hover:text-primary"
                    >
                      {owner.email}
                    </a>
                    {owner.phone ? (
                      <a
                        href={`tel:${owner.phone}`}
                        className="block text-default-500 hover:text-primary"
                      >
                        {owner.phone}
                      </a>
                    ) : null}
                  </div>
                </DetailRow>
                <DetailRow
                  icon={<Calendar className="h-4 w-4 shrink-0 text-primary" />}
                  label="Created"
                >
                  {formatDate({ date: ticket.createdAt })}
                </DetailRow>
                <DetailRow
                  icon={<CalendarClock className="h-4 w-4 shrink-0 text-primary" />}
                  label="Updated"
                >
                  {formatDate({ date: ticket.updatedAt })}
                </DetailRow>
              </ul>

              <div className="mt-5 border-t border-border pt-4">
                <p className="mb-2.5 text-sm font-semibold text-default-900">Attachment</p>
                {ticket.attachment ? (
                  <AttachmentPreview url={ticket.attachment} />
                ) : (
                  <p className="text-xs text-default-500">No attachment.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
