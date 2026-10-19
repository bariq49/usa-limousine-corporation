"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { MenuSection, RoleKey } from "../types/navigation";
import { omitUndefined } from "../utils/cn";

interface ShellContextValue {
  appName: string;
  navigation: MenuSection[];
  roles?: RoleKey[];
}

const ShellContext = createContext<ShellContextValue | null>(null);

export function ShellProvider({
  appName,
  navigation,
  roles,
  children,
}: ShellContextValue & { children: ReactNode }) {
  return (
    <ShellContext.Provider value={{ appName, navigation, ...omitUndefined({ roles }) }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell(): ShellContextValue {
  const value = useContext(ShellContext);
  if (!value) {
    throw new Error("useShell must be used within ShellProvider");
  }
  return value;
}
