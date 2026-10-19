"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { RoleKey } from "../types/navigation";

export interface UserSummary {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  roles: RoleKey[];
  avatar?: string | null;
  sessionId?: string;
}

export interface UserContextValue {
  user: UserSummary | null;
  onLogout?: (() => void) | undefined;
  isLoggingOut?: boolean | undefined;
  onUpdateUser?: ((user: Partial<UserSummary>) => void) | undefined;
}

const UserContext = createContext<UserContextValue>({ user: null });

export function UserProvider({
  user,
  onLogout,
  isLoggingOut,
  onUpdateUser,
  children,
}: UserContextValue & { children: ReactNode }) {
  return (
    <UserContext.Provider value={{ user, onLogout, isLoggingOut, onUpdateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextValue {
  return useContext(UserContext);
}
