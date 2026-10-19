import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { UiProviders } from "@usa-limousine-corporation/ui/providers/app-providers";
import { APP_CONFIG } from "../config/app";
import { TopLoader } from "../components/top-loader";
import { QueryProvider } from "../providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.displayName,
    template: `%s | ${APP_CONFIG.displayName}`,
  },
  description: APP_CONFIG.description,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-sm text-foreground">
        <QueryProvider>
          <UiProviders>
            <Suspense fallback={null}>
              <TopLoader />
            </Suspense>
            {children}
          </UiProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
