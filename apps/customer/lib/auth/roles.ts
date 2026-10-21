import type { CurrentUser } from "../api/types";

export const CUSTOMER_ROLE = "CUSTOMER" as const;

export function isCustomerUser(user: CurrentUser | null | undefined): boolean {
  return Boolean(user?.roles?.includes(CUSTOMER_ROLE));
}
