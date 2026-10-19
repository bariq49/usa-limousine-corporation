import type { RoleKey } from "@usa-limousine-corporation/ui/types/navigation";

export type AuthTokens = {
  accessToken: string;
  sessionId: string;
};

export type CsrfResponse = {
  csrfToken: string;
};

export type CurrentUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  roles: RoleKey[];
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  sessionId: string;
  avatar: string | null;
};
