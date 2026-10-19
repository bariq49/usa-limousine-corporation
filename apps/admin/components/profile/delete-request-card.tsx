"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@usa-limousine-corporation/ui/components/card";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { ConfirmDialog } from "@usa-limousine-corporation/ui/components/confirm-dialog";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { formatDate } from "@usa-limousine-corporation/ui/utils/date";
import { CalendarClock, Graph, Trash } from "@usa-limousine-corporation/ui/svg";
import { useForm } from "react-hook-form";
import type { Driver } from "@/lib/types/drivers";
import {
  useApproveDelete,
  useDriverDeleteRequest,
  useRejectDelete,
} from "@/hooks/queries/use-delete-requests";

export interface DeleteRequestCardProps {
  driver?: Driver | null | undefined;
}

type ConfirmAction = "approve" | "reject" | null;

type RejectForm = {
  adminNote: string;
};

function formatStatus(status: string) {
  if (!status) return "—";
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function DeleteRequestCard({ driver }: DeleteRequestCardProps) {
  const router = useRouter();
  const { data } = useDriverDeleteRequest(driver?.id ?? "");
  const approveMutation = useApproveDelete();
  const rejectMutation = useRejectDelete();

  const [action, setAction] = useState<ConfirmAction>(null);
  const rejectForm = useForm<RejectForm>({
    defaultValues: { adminNote: "" },
  });

  const request = data?.request;
  if (!driver?.id || !request) return null;

  const isPending = request.status === "PENDING";
  const isMutating = approveMutation.isPending || rejectMutation.isPending;
  const driverName = `${driver.firstName} ${driver.lastName}`.trim();
  const requestedAt = formatDate({ date: request.createdAt });
  const processedAt = formatDate({ date: request.processedAt });

  const resetDialog = () => {
    setAction(null);
    rejectForm.reset({ adminNote: "" });
  };

  const handleConfirm = () => {
    if (action === "approve") {
      approveMutation.mutate(request.id, {
        onSuccess: () => {
          resetDialog();
          router.push("/delete-requests");
        },
      });
      return;
    }

    if (action === "reject") {
      const adminNote = rejectForm.getValues("adminNote").trim();
      rejectMutation.mutate(adminNote ? { id: request.id, adminNote } : { id: request.id }, {
        onSuccess: resetDialog,
      });
    }
  };

  return (
    <>
      <Card className="h-full w-full shadow-xs border border-border">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 -ml-2">
              <Trash className="h-6 w-6 text-primary" />
              <CardTitle className="text-lg font-semibold text-default-900">
                Account Deletion Request
              </CardTitle>
            </div>

            {isPending ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAction("reject")}
                  disabled={isMutating}
                >
                  Reject
                </Button>
                <Button
                  color="default"
                  size="sm"
                  onClick={() => setAction("approve")}
                  disabled={isMutating}
                >
                  Approve
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Requested:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {requestedAt && requestedAt !== "—" ? requestedAt : "—"}
              </span>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Graph className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Status:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {formatStatus(request.status)}
              </span>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <CalendarClock className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Processed:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700">
                {processedAt && processedAt !== "—" ? processedAt : "—"}
              </span>
            </li>

            <li className="flex items-start gap-3">
              <div className="flex w-[145px] shrink-0 items-center gap-2">
                <Trash className="h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-default-800">Reason:</span>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-default-700 whitespace-pre-line">
                {request.reason || "—"}
              </span>
            </li>

            {request.adminNote ? (
              <li className="flex items-start gap-3">
                <div className="flex w-[145px] shrink-0 items-center gap-2">
                  <Graph className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-semibold text-default-800">Admin note:</span>
                </div>
                <span className="min-w-0 flex-1 break-words text-sm text-default-700 whitespace-pre-line">
                  {request.adminNote}
                </span>
              </li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) resetDialog();
        }}
        title={action === "approve" ? "Approve delete request" : "Reject delete request"}
        description={
          action === "approve"
            ? `Approve account deletion for ${driverName || "this driver"}? The account will be deactivated.`
            : `Reject account deletion for ${driverName || "this driver"}? Optionally add a note.`
        }
        confirmLabel={action === "approve" ? "Approve" : "Reject"}
        confirmColor={action === "reject" ? "destructive" : "default"}
        pending={isMutating}
        onConfirm={handleConfirm}
      >
        {action === "reject" ? (
          <Form {...rejectForm}>
            <Input
              name="adminNote"
              label="Admin note (optional)"
              type="textarea"
              rows={3}
              disabled={rejectMutation.isPending}
            />
          </Form>
        ) : null}
      </ConfirmDialog>
    </>
  );
}
