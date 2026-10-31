"use client";

import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { NotificationList } from "@usa-limousine-corporation/ui/components/notifications/notification-list";

const crumbs = [{ label: "Home", href: "/analytics" }, { label: "Notifications" }];

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />
      <NotificationList />
    </div>
  );
}
