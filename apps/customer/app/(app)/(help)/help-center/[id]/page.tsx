"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@usa-limousine-corporation/ui/components/badge";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { PageHeader } from "@usa-limousine-corporation/ui/layout/page-header";
import { useUser } from "@usa-limousine-corporation/ui/providers/user-context";
import { cn } from "@usa-limousine-corporation/ui/utils/cn";
import { formatDateTime } from "@usa-limousine-corporation/ui/utils/date";
import { useReplyToTicket, useTicket } from "@/hooks/queries/use-tickets";
import { CATEGORY_LABELS, STATUS_COLORS, STATUS_LABELS, canReply } from "@/lib/utils/ticket-labels";

const replySchema = z.object({ body: z.string().trim().min(1).max(5000) });
type ReplyValues = z.infer<typeof replySchema>;

export default function TicketPage() {
  const params = useParams<{ id: string }>();
  const ticketId = params.id;
  const { user } = useUser();
  const { data: ticket, isLoading, isError } = useTicket(ticketId);
  const reply = useReplyToTicket(ticketId);
  const form = useForm<ReplyValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { body: "" },
  });
  const body = form.watch("body");

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <Card className="shadow-xs">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-default-600">This ticket could not be found.</p>
          <Button asChild variant="outline" size="sm" className="mt-4">
            <Link href="/help-center">Back to Help Center</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const messages = ticket.messages ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={ticket.subject}
        breadcrumbs={[
          { label: "Home", href: "/dashboard" },
          { label: "Help Center", href: "/help-center" },
          { label: ticket.ticketNumber },
        ]}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Card className="shadow-xs">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold text-default-900">Conversation</h2>
              <div className="mt-4 space-y-3">
                {messages.map((message) => {
                  const mine = message.authorUserId !== null && message.authorUserId === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={cn("flex", mine ? "justify-end" : "justify-start")}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-4 py-3",
                          mine ? "bg-primary/10" : "border border-border bg-card",
                        )}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-semibold text-default-800">
                            {mine ? "You" : "Support team"}
                          </span>
                          <span className="text-[11px] text-default-500">
                            {formatDateTime({ date: message.createdAt })}
                          </span>
                        </div>
                        <p className="mt-1.5 text-sm whitespace-pre-wrap text-default-800">
                          {message.body}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {canReply(ticket.status) ? (
                <Form {...form}>
                  <form
                    className="mt-6 space-y-3 border-t border-border pt-4"
                    onSubmit={form.handleSubmit((values) =>
                      reply.mutate(values.body, { onSuccess: () => form.reset({ body: "" }) }),
                    )}
                  >
                    <Input
                      name="body"
                      label="Write a reply"
                      type="textarea"
                      rows={3}
                      disabled={reply.isPending}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!body?.trim() || reply.isPending}
                        isLoading={reply.isPending}
                      >
                        Send reply
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <p className="mt-6 border-t border-border pt-4 text-xs text-default-500">
                  This ticket is {STATUS_LABELS[ticket.status].toLowerCase()}. Create a new ticket
                  if you still need help.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-4">
          <Card className="shadow-xs">
            <CardContent className="space-y-4 p-6 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-default-500">Status</span>
                <Badge color={STATUS_COLORS[ticket.status]} variant="soft">
                  {STATUS_LABELS[ticket.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-default-500">Ticket</span>
                <span className="font-medium text-default-900">{ticket.ticketNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-default-500">Category</span>
                <span className="font-medium text-default-900">
                  {CATEGORY_LABELS[ticket.category]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-default-500">Created</span>
                <span className="font-medium text-default-900">
                  {formatDateTime({ date: ticket.createdAt })}
                </span>
              </div>
              {ticket.attachment ? (
                <div className="flex items-center justify-between">
                  <span className="text-default-500">Attachment</span>
                  <a
                    href={ticket.attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    Open file
                  </a>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
