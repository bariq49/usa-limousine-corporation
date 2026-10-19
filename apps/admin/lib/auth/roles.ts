import type { CurrentUser } from "../types/auth";

export const ADMIN_ROLE = "SUPER_ADMIN" as const;

export function isAdminUser(user: CurrentUser | null | undefined): boolean {
  return Boolean(user?.roles?.includes(ADMIN_ROLE));
}
