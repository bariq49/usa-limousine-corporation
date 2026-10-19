"use client";

import { type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./theme-provider";

export function UiProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Toaster position="top-right" />
      {children}
    </ThemeProvider>
  );
}
