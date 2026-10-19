"use client";

import { useState } from "react";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@usa-limousine-corporation/ui/components/avatar";
import { TabsList, TabsTrigger } from "@usa-limousine-corporation/ui/components/tabs";
import { ConfirmDialog } from "@usa-limousine-corporation/ui/components/confirm-dialog";
import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Input } from "@usa-limousine-corporation/ui/components/input";
import { Form } from "@usa-limousine-corporation/ui/components/form";
import { BadgeCheck } from "lucide-react";
import {
  Dashboard,
  Blog,
  UserSign,
  Graph,
  Car,
  Device,
  CalendarCheck,
} from "@usa-limousine-corporation/ui/svg";
import { useForm } from "react-hook-form";
import {
  useOverview,
  useApprove,
  useReject,
  useMarkUnderReview,
  useSuspend,
  useUnsuspend,
} from "@/hooks/queries/use-drivers";

type ConfirmAction = "under-review" | "approve" | "reject" | "suspend" | "unsuspend" | null;

type RejectForm = {
  reason: string;
};

export function Header({ driverId }: { driverId: string }) {
  const { data: driver } = useOverview(driverId);
  const approveMutation = useApprove();
  const rejectMutation = useReject();
  const markUnderReviewMutation = useMarkUnderReview();
  const suspendMutation = useSuspend();
  const unsuspendMutation = useUnsuspend();

  const [action, setAction] = useState<ConfirmAction>(null);
  const rejectForm = useForm<RejectForm>({
    defaultValues: { reason: "" },
  });

  const driverName = driver?.firstName ? `${driver.firstName} ${driver.lastName}` : "this driver";

  const isPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    markUnderReviewMutation.isPending ||
    suspendMutation.isPending ||
    unsuspendMutation.isPending;

  const isApproved = driver?.approvalStatus === "APPROVED";
  const isSuspended = driver?.status === "SUSPENDED";

  const resetDialog = () => {
    setAction(null);
    rejectForm.reset({ reason: "" });
  };

  const handleConfirm = () => {
    if (action === "under-review") {
      markUnderReviewMutation.mutate(driverId, { onSuccess: resetDialog });
      return;
    }

    if (action === "approve") {
      approveMutation.mutate(driverId, { onSuccess: resetDialog });
      return;
    }

    if (action === "reject") {
      const reason = rejectForm.getValues("reason").trim() || "No reason provided";
      rejectMutation.mutate({ id: driverId, reason }, { onSuccess: resetDialog });
      return;
    }

    if (action === "suspend") {
      suspendMutation.mutate(driverId, { onSuccess: resetDialog });
      return;
    }

    if (action === "unsuspend") {
      unsuspendMutation.mutate(driverId, { onSuccess: resetDialog });
    }
  };

  const dialogTitle =
    action === "approve"
      ? "Approve driver"
      : action === "reject"
        ? "Reject driver"
        : action === "under-review"
          ? driver?.approvalStatus === "REJECTED"
            ? "Re-evaluate application"
            : "Mark under review"
          : action === "suspend"
            ? "Suspend driver"
            : action === "unsuspend"
              ? "Unsuspend driver"
              : "";

  const dialogDescription =
    action === "approve"
      ? `Approve ${driverName}? Documents will also be approved.`
      : action === "reject"
        ? `Reject ${driverName}? Please provide a reason.`
        : action === "under-review"
          ? driver?.approvalStatus === "REJECTED"
            ? `Move ${driverName} back to under review?`
            : `Mark ${driverName}'s application as under review?`
          : action === "suspend"
            ? `Suspend ${driverName}? They must have no active or upcoming trips. They will be forced offline and cannot log in until unsuspended.`
            : action === "unsuspend"
              ? `Unsuspend ${driverName}? They will be able to log in and go online again.`
              : "";

  const confirmLabel =
    action === "approve"
      ? "Approve"
      : action === "reject"
        ? "Reject"
        : action === "suspend"
          ? "Suspend"
          : action === "unsuspend"
            ? "Unsuspend"
            : driver?.approvalStatus === "REJECTED"
              ? "Re-evaluate"
              : "Mark under review";

  const confirmColor = action === "reject" || action === "suspend" ? "destructive" : "default";

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/analytics" },
          { label: "Drivers", href: "/drivers" },
          { label: "Profile" },
        ]}
      />

      <div className="relative">
        <Card className="overflow-visible rounded-lg shadow-xs border border-border">
          <CardContent className="p-0">
            <div
              className="relative h-[250px] w-full rounded-t-lg bg-cover bg-center bg-no-repeat md:h-[280px] lg:h-[300px]"
              style={{
                backgroundImage: "url(/assets/images/profile/user-cover.png)",
              }}
            >
              <div className="absolute inset-x-0 bottom-0 px-6 lg:px-8 flex justify-between items-end w-full">
                <div className="flex min-w-0 items-end gap-4 sm:gap-5">
                  <div className="relative z-10 shrink-0 mb-[-22px] lg:mb-[-26px]">
                    <Avatar className="h-[100px] w-[100px] rounded-full border-4 border-background bg-background shadow-md sm:h-[110px] sm:w-[110px] lg:h-[120px] lg:w-[120px]">
                      {driver?.avatarUrl ? (
                        <AvatarImage
                          src={driver.avatarUrl}
                          alt={driverName}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : null}

                      <AvatarFallback className="bg-primary/20 text-2xl font-bold text-primary lg:text-3xl">
                        {driver?.firstName
                          ? (driver.firstName + " " + driver.lastName)[0]
                          : "?".toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="min-w-0 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] pb-1.5 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-lg font-bold tracking-tight text-white lg:text-xl">
                        {driver?.firstName ? driverName : "..."}
                      </div>
                      {isApproved && (
                        <BadgeCheck
                          className="h-4.5 w-4.5 text-sky-400 shrink-0 lg:h-5 lg:w-5"
                          fill="currentColor"
                          stroke="white"
                          strokeWidth={2}
                        />
                      )}
                    </div>

                    {driver?.email ? (
                      <div className="flex items-center text-sm font-medium text-white/90 lg:text-base">
                        <span className="truncate">{driver.email}</span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-2 pb-1.5 shrink-0 mb-4 lg:mb-5">
                  {driver?.approvalStatus === "PENDING" && (
                    <Button
                      color="default"
                      size="sm"
                      onClick={() => setAction("under-review")}
                      disabled={isPending}
                    >
                      Mark Under Review
                    </Button>
                  )}

                  {driver?.approvalStatus === "UNDER_REVIEW" && (
                    <>
                      <Button
                        color="destructive"
                        size="sm"
                        onClick={() => setAction("reject")}
                        disabled={isPending}
                      >
                        Reject
                      </Button>
                      <Button
                        color="default"
                        size="sm"
                        onClick={() => setAction("approve")}
                        disabled={isPending}
                      >
                        Approve
                      </Button>
                    </>
                  )}

                  {driver?.approvalStatus === "REJECTED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAction("under-review")}
                      disabled={isPending}
                    >
                      Re-evaluate
                    </Button>
                  )}

                  {isApproved &&
                    (isSuspended ? (
                      <Button
                        color="default"
                        size="sm"
                        onClick={() => setAction("unsuspend")}
                        disabled={isPending}
                      >
                        Unsuspend
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAction("suspend")}
                        disabled={isPending}
                        className="bg-background/90"
                      >
                        Suspend
                      </Button>
                    ))}
                </div>
              </div>
            </div>
            <div className="relative z-20 flex justify-end items-center px-6 lg:px-8 h-11">
              <TabsList className="bg-transparent p-0 gap-6 h-full items-center">
                <TabsTrigger
                  value="overview"
                  className="cursor-pointer flex h-full items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 border-b-2 border-transparent text-sm"
                >
                  <Dashboard className="w-4 h-4 fill-current" />
                  Overview
                </TabsTrigger>

                <TabsTrigger
                  value="documents"
                  className="cursor-pointer flex h-full items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 border-b-2 border-transparent text-sm"
                >
                  <Blog className="w-4 h-4 fill-current" />
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="vehicle"
                  className="cursor-pointer flex h-full items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 border-b-2 border-transparent text-sm"
                >
                  <Car className="w-4 h-4 fill-current" />
                  Vehicle
                </TabsTrigger>
                <TabsTrigger
                  value="reviews"
                  className="cursor-pointer flex h-full items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 border-b-2 border-transparent text-sm"
                >
                  <UserSign className="w-4 h-4 fill-current" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="cursor-pointer flex h-full items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 border-b-2 border-transparent text-sm"
                >
                  <Device className="w-4 h-4 fill-current" />
                  Activity
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="cursor-pointer flex h-full items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 border-b-2 border-transparent text-sm"
                >
                  <CalendarCheck className="w-4 h-4 fill-current" />
                  Performance
                </TabsTrigger>
                <TabsTrigger
                  value="wallet"
                  className="cursor-pointer flex h-full items-center gap-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-0 border-b-2 border-transparent text-sm"
                >
                  <Graph className="w-4 h-4 fill-current" />
                  Wallet
                </TabsTrigger>
              </TabsList>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => {
          if (!open) resetDialog();
        }}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={confirmLabel}
        confirmColor={confirmColor}
        pending={isPending}
        onConfirm={handleConfirm}
      >
        {action === "reject" ? (
          <Form {...rejectForm}>
            <Input
              name="reason"
              label="Rejection reason"
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
