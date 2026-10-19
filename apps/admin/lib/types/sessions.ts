export interface SessionApiItem {
  id: string;
  deviceId: string;
  ipAddress: string | null;
  userAgent: string | null;
  expiresAt: string;
  revokedAt?: string | null;
  lastSeenAt: string;
  createdAt: string;
}

export type { Session } from "@usa-limousine-corporation/ui/types/session";
