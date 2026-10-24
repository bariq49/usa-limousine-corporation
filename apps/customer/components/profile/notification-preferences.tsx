"use client";

import { Button } from "@usa-limousine-corporation/ui/components/button";
import { Card, CardContent } from "@usa-limousine-corporation/ui/components/card";
import { Skeleton } from "@usa-limousine-corporation/ui/components/skeleton";
import { Switch } from "@usa-limousine-corporation/ui/components/switch";
import { useCustomerSettings, useUpdateCustomerSettings } from "@/hooks/queries/use-settings";

export function NotificationPreferences() {
  const { data: settings, isLoading, isError, refetch } = useCustomerSettings();
  const update = useUpdateCustomerSettings();

  return (
    <Card className="shadow-xs">
      <CardContent className="p-6">
        <h2 className="text-lg font-bold text-default-900">Notification Preferences</h2>
        <p className="mt-1 text-sm text-default-500">
          Choose how we keep you updated about bookings and support tickets.
        </p>

        {isError ? (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-md border border-border p-4">
            <p className="text-sm text-default-600">We couldn&apos;t load your settings.</p>
            <Button type="button" size="sm" variant="outline" onClick={() => void refetch()}>
              Try again
            </Button>
          </div>
        ) : isLoading || !settings ? (
          <div className="mt-6 space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-default-800">Email notifications</p>
                <p className="text-xs text-default-500">Booking updates by email.</p>
              </div>
              <Switch
                checked={settings.email}
                disabled={update.isPending}
                aria-label="Email notifications"
                onCheckedChange={(checked) => update.mutate({ email: checked })}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-default-800">SMS notifications</p>
                <p className="text-xs text-default-500">
                  Booking confirmations and changes by text message.
                </p>
              </div>
              <Switch
                checked={settings.sms}
                disabled={update.isPending}
                aria-label="SMS notifications"
                onCheckedChange={(checked) => update.mutate({ sms: checked })}
              />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-default-800">Dashboard notifications</p>
                <p className="text-xs text-default-500">
                  Updates in the notification bell of your dashboard.
                </p>
              </div>
              <Switch
                checked={settings.notification}
                disabled={update.isPending}
                aria-label="Dashboard notifications"
                onCheckedChange={(checked) => update.mutate({ notification: checked })}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
