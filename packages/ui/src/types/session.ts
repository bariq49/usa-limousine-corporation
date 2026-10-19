export interface Session {
  id: string;
  deviceId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt: string;
  revokedAt?: string | null;
  lastSeenAt: string;
  createdAt: string;
}

export interface SessionOptions {
  currentSessionId?: string | null | undefined;
  onRevoke?: ((session: Session) => void) | undefined;
  onDelete?: ((session: Session) => void) | undefined;
}
