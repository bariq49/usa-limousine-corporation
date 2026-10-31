"use client";

import { PageHeader } from "@usa-limousine-corporation/ui/layout/page-header";
import { NotificationList } from "@usa-limousine-corporation/ui/components/notifications/notification-list";

export default function CustomerNotificationsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Updates about your bookings and support tickets."
        breadcrumbs={[{ label: "Customer" }, { label: "Notifications" }]}
      />
      <NotificationList />
    </div>
  );
}
