"use client";

import { type ReactNode, Suspense } from "react";
import type { MenuSection } from "../types/navigation";
import { cn } from "../utils/cn";
import { useSidebar } from "../store/sidebar";
import { useMounted } from "../hooks/use-mounted";
import { ShellProvider } from "../providers/shell-context";
import { Header } from "./header";
import { Sidebar } from "./sidebar/sidebar";
import { LayoutLoader } from "./layout-loader";
import { ScrollLockFix } from "./scroll-lock-fix";

export interface DashboardShellProps {
  appName: string;
  navigation: MenuSection[];
  children: ReactNode;
}

export function DashboardShell({ appName, navigation, children }: DashboardShellProps) {
  return (
    <ShellProvider appName={appName} navigation={navigation}>
      <DashBoardFrame>{children}</DashBoardFrame>
    </ShellProvider>
  );
}

function DashBoardFrame({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar();
  const mounted = useMounted();

  if (!mounted) {
    return <LayoutLoader />;
  }

  return (
    <>
      <ScrollLockFix />
      <div className="min-h-screen overflow-x-clip bg-background max-md:bg-card">
        <Header />
        <Sidebar />
        <div
          className={cn(
            "content-wrapper page-min-height max-w-full min-h-screen bg-background transition-all duration-150 max-md:bg-card",
            {
              "xl:ml-[300px]": !collapsed,
              "xl:ml-[72px]": collapsed,
            },
          )}
        >
          <div className="layout-padding page-min-height max-w-full px-4 pt-6 sm:px-6">
            <main>
              <Suspense fallback={<LayoutLoader />}>{children}</Suspense>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
