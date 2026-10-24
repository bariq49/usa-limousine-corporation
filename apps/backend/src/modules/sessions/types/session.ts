export interface Create {
  userId: string;
  deviceId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface GetById {
  id: string;
}

export interface ListByUser {
  userId: string;
}

export interface RotateRefreshToken {
  sessionId: string;
  currentTokenHash: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface RevokeCurrent {
  sessionId: string;
}

export interface RevokeOwned {
  userId: string;
  sessionId: string;
  callerSessionId: string;
}

export interface RevokeAll {
  userId: string;
}

