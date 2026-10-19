"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type CSSProperties, type ReactNode } from "react";
import { TooltipProvider } from "../components/tooltip";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <div style={{ "--radius": "0.5rem" } as CSSProperties} className="min-h-screen">
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </NextThemesProvider>
    </div>
  );
}
