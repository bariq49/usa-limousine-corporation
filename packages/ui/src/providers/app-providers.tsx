"use client";

import { type ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { useMediaQuery } from "../hooks/use-media-query";
import { ThemeProvider } from "./theme-provider";

export function UiProviders({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ThemeProvider>
      <Toaster position={isDesktop ? "top-right" : "top-center"} />
      {children}
    </ThemeProvider>
  );
}
