export type Payload = Record<string, unknown> | string | number | boolean | null;

export type WebsocketIdentity = {
  userId: string;
  sessionId: string;
  expiresAt: number;
};

export type WebSocketConfig = {
  corsOrigin: boolean | string | string[];
  port?: number | undefined;
  maxConnectionsPerUser: number;
  connectRateLimitPerMinute: number;
  sessionRevalidateSeconds: number;
};

export type Broadcast = {
  event: string;
  payload: Payload;
};

export type BroadcastToRoom = {
  room: string;
  event: string;
  payload: Payload;
};

export type RoomMembership = {
  from: string;
  room: string;
  join: boolean;
};
