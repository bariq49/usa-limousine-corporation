"use client";

import { type ReactNode } from "react";
import { DashboardShell } from "@usa-limousine-corporation/ui/layout/dashboard-layout-provider";
import { APP_NAME, navigation } from "../config/navigation";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <DashboardShell appName={APP_NAME} navigation={navigation}>
      {children}
    </DashboardShell>
  );
}
