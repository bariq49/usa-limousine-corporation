"use client";

import { Breadcrumbs } from "@usa-limousine-corporation/ui/layout/breadcrumbs";
import { NotificationsPage } from "@usa-limousine-corporation/ui/components/notifications/notifications-page";

const crumbs = [{ label: "Home", href: "/analytics" }, { label: "Notifications" }];

export default function AdminNotificationsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={crumbs} />
      <NotificationsPage />
    </div>
  );
}
