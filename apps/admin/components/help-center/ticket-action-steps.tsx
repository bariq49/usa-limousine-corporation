"use client";

import { Check, Lock } from "lucide-react";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import type { UseFormReturn } from "react-hook-form";
import type { TicketPriority, TicketStatus } from "@/lib/types/tickets";
import {
  PRIORITY_OPTIONS,
  REOPEN_STATUS,
  STATUS_LABELS,
  STATUS_STEPS,
  canReopen,
  forwardStatus,
  statusActionLabel,
} from "@/lib/utils/ticket-labels";

type StatusForm = {
  status: TicketStatus;
  note: string;
};

type PriorityForm = {
  priority: TicketPriority;
};

type Props = {
  currentStatus: TicketStatus;
  currentPriority: TicketPriority;
  statusForm: UseFormReturn<StatusForm>;
  priorityForm: UseFormReturn<PriorityForm>;
  statusPending: boolean;
  priorityPending: boolean;
  onSaveStatus: (values: StatusForm) => void;
  onSavePriority: (values: PriorityForm) => void;
};

function stepState(current: TicketStatus, step: TicketStatus) {
  const currentIndex = STATUS_STEPS.indexOf(current);
  const stepIndex = STATUS_STEPS.indexOf(step);
  if (step === current) return "current" as const;
  if (stepIndex < currentIndex) return "done" as const;
  return "upcoming" as const;
}

export function TicketActionSteps(props: Props) {
  const {
    currentStatus,
    currentPriority,
    statusForm,
    priorityForm,
    statusPending,
    priorityPending,
    onSaveStatus,
    onSavePriority,
  } = props;

  const next = forwardStatus(currentStatus);
  const reopenAllowed = canReopen(currentStatus);
  const isClosed = currentStatus === "CLOSED";
  const note = statusForm.watch("note");
  const pendingTarget = statusForm.watch("status");
  const priorityUnchanged = priorityForm.watch("priority") === currentPriority;

  const submitStatus = (status: TicketStatus) => {
    const trimmed = (statusForm.getValues("note") || "").trim();
    if (status === REOPEN_STATUS && !trimmed) return;
    statusForm.setValue("status", status);
    onSaveStatus({ status, note: trimmed });
  };

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-default-900">Lifecycle</h3>
          <p className="mt-0.5 text-xs text-default-500">One stage at a time. Closed is final.</p>
        </div>

        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-5 sm:gap-0">
          {STATUS_STEPS.map((step, index) => {
            const state = stepState(currentStatus, step);
            const isLast = index === STATUS_STEPS.length - 1;

            return (
              <li key={step} className="relative flex sm:flex-col sm:items-center">
                {!isLast ? (
                  <div
                    aria-hidden
                    className={[
                      "absolute left-4 top-8 h-[calc(100%-0.5rem)] w-0.5 sm:left-[calc(50%+1rem)] sm:right-0 sm:top-4 sm:h-0.5 sm:w-[calc(100%-2rem)]",
                      state === "done" ? "bg-emerald-500" : "bg-border",
                    ].join(" ")}
                  />
                ) : null}

                <div className="relative z-10 flex w-full items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
                  <span
                    className={[
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                      state === "current"
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "",
                      state === "done" ? "border-emerald-500 bg-emerald-500 text-white" : "",
                      state === "upcoming" ? "border-border bg-card text-default-400" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {state === "done" ? <Check className="h-4 w-4" strokeWidth={2.5} /> : index + 1}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={[
                        "block text-xs font-semibold",
                        state === "current" ? "text-primary" : "",
                        state === "done" ? "text-emerald-700" : "",
                        state === "upcoming" ? "text-default-400" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {STATUS_LABELS[step]}
                    </span>
                    {state === "current" ? (
                      <span className="block text-[11px] text-default-500">Current</span>
                    ) : null}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {isClosed ? (
        <div className="flex items-start gap-2.5 rounded-md border border-border bg-default-50 px-3.5 py-3">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-default-500" />
          <div className="min-w-0 text-xs leading-5 text-default-600">
            <span className="font-semibold text-default-800">Ticket closed. </span>
            Status and priority are locked. Open a new ticket if the issue returns.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 lg:grid-cols-[1.4fr_1fr]">
          <Form {...statusForm}>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-default-900">Advance status</p>
                <p className="mt-0.5 text-xs text-default-500">
                  {next
                    ? `Next: ${STATUS_LABELS[next]}`
                    : "Close the ticket or reopen with a note."}
                </p>
              </div>
              <Input
                name="note"
                label={reopenAllowed ? "Note" : "Note (optional)"}
                type="textarea"
                rows={2}
                disabled={statusPending}
                placeholder={
                  reopenAllowed
                    ? "Required to reopen. Optional when closing."
                    : "Optional note for this change"
                }
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                {next ? (
                  <Button
                    type="button"
                    size="sm"
                    className="sm:min-w-[140px]"
                    disabled={statusPending}
                    isLoading={statusPending && pendingTarget === next}
                    onClick={() => submitStatus(next)}
                  >
                    {statusActionLabel(next)}
                  </Button>
                ) : null}
                {reopenAllowed ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="sm:min-w-[120px]"
                    disabled={statusPending || !note.trim()}
                    isLoading={statusPending && pendingTarget === REOPEN_STATUS}
                    onClick={() => submitStatus(REOPEN_STATUS)}
                  >
                    Reopen
                  </Button>
                ) : null}
              </div>
            </div>
          </Form>

          <Form {...priorityForm}>
            <form
              className="space-y-3 lg:border-l lg:border-border lg:pl-4"
              onSubmit={priorityForm.handleSubmit(onSavePriority)}
            >
              <div>
                <p className="text-sm font-semibold text-default-900">Priority</p>
                <p className="mt-0.5 text-xs text-default-500">Queue urgency only.</p>
              </div>
              <Input
                name="priority"
                label="Priority"
                type="select"
                options={PRIORITY_OPTIONS}
                disabled={priorityPending}
              />
              <Button
                type="submit"
                size="sm"
                variant="outline"
                disabled={priorityUnchanged || priorityPending}
                isLoading={priorityPending}
              >
                Save priority
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
